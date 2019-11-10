import cdk = require("@aws-cdk/core");
import {Artifact, Pipeline} from "@aws-cdk/aws-codepipeline";
import {
    CloudFormationCreateReplaceChangeSetAction,
    CloudFormationExecuteChangeSetAction,
    CodeBuildAction,
    GitHubSourceAction,
    GitHubTrigger
} from "@aws-cdk/aws-codepipeline-actions";
import {SecretValue} from "@aws-cdk/core";
import {BuildSpec, Project} from "@aws-cdk/aws-codebuild";
import {CodePipelineSource} from "@aws-cdk/aws-codebuild/lib/codepipeline-source";
import {Role} from '@aws-cdk/aws-iam';

export interface CdkDeployPipelineProps {
    deploymentRole: Role;
    serviceStackName: string
}

export class CdkDeployPipeline extends cdk.Construct {
    private pipeline: Pipeline;
    constructor(scope: cdk.Stack, id: string, props: CdkDeployPipelineProps) {
        super(scope, id);

        this.pipeline = new Pipeline(this, 'DeploymentPipeline', {
            pipelineName: 'cdk-deployment-pipeline'
        });

        const cdkArtifact = new Artifact('cdkSource');
        this.pipeline.addStage({
            stageName: 'service-source',
            actions: [
                new GitHubSourceAction({
                    repo: 'cdk-demo',
                    owner: 'FabricGroup',
                    branch: 'development',
                    actionName: 'github-cdk-source',
                    oauthToken: SecretValue.secretsManager('cdk-demo/github/goose-token'),
                    output: cdkArtifact,
                    trigger: GitHubTrigger.WEBHOOK,
                })
            ]
        });

        const buildOutputArtifact = this.addBuildStage(cdkArtifact);

        this.addDeploymentStages(props, buildOutputArtifact, 'cdk-deploy-stack');
        this.addDeploymentStages(props, buildOutputArtifact, props.serviceStackName);
    }

    private addBuildStage(cdkArtifact: Artifact) {
        const project = new Project(this, 'CdkDeploymentProject', {
            projectName: 'cdk-deployment-project',
            environment: {
                privileged: false
            },
            source: new CodePipelineSource(),
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        'runtime-versions': {
                            nodejs: 10
                        },
                        commands: [
                            'apt-get update -y',
                            'apt-get install apt-transport-https',
                            'curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add',
                            'echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list',
                            'apt-get update -y',
                            'apt-get install -y yarn'
                        ]
                    },
                    build: {
                        commands: [
                            'yarn install',
                            `yarn cdk synth`
                        ]
                    }
                },
                artifacts: {
                    files: [
                        '*.template.json'
                    ],
                    'discard-paths': true,
                    'base-directory': 'cdk.out'
                }
            })
        });

        const buildOutputArtifact = new Artifact();
        this.pipeline.addStage({
            stageName: 'build',
            actions: [
                new CodeBuildAction({
                    actionName: 'build',
                    input: cdkArtifact,
                    project: project,
                    outputs: [buildOutputArtifact]
                })
            ]
        });
        return buildOutputArtifact;
    }

    private addDeploymentStages(props: CdkDeployPipelineProps, inputArtifact: Artifact, stackName: string) {
        const serviceStackTemplateFile = `${stackName}.template.json`;
        this.pipeline.addStage({
            stageName: `${stackName}-deploy`,
            actions: [
                new CloudFormationCreateReplaceChangeSetAction({
                    actionName: 'create-changeset',
                    stackName,
                    changeSetName: `${stackName}-changeset`,
                    templatePath: inputArtifact.atPath(serviceStackTemplateFile),
                    deploymentRole: props.deploymentRole,
                    adminPermissions: false
                }),
                new CloudFormationExecuteChangeSetAction({
                    actionName: 'execute-changeset',
                    stackName,
                    changeSetName: `${stackName}-changeset`
                })
            ]
        });
    }
}
