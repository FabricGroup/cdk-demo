import cdk = require("@aws-cdk/core");
import {Artifact, Pipeline} from "@aws-cdk/aws-codepipeline";
import {CodeBuildAction, GitHubSourceAction, GitHubTrigger} from "@aws-cdk/aws-codepipeline-actions";
import {SecretValue} from "@aws-cdk/core";
import {Project} from "@aws-cdk/aws-codebuild";
import {CodePipelineSource} from "@aws-cdk/aws-codebuild/lib/codepipeline-source";
import {Repository} from '@aws-cdk/aws-ecr';

export interface DemoPipelineProps {
    repo: string
    owner: string
    branch: string,
    githubTokenName: string;
    ecrRepository: Repository
}

export class DemoPipeline extends cdk.Construct {
    constructor(scope: cdk.Stack, id: string, props: DemoPipelineProps) {
        super(scope, id);

        const pipeline = new Pipeline(this, 'DemoCodePipeline', {
            pipelineName: 'container-demo-pipeline'
        });

        const sourceArtifact = new Artifact('serviceSource');
        const githubTokenName = props.githubTokenName;
        pipeline.addStage({
            stageName: 'service-source',
            actions: [
                new GitHubSourceAction({
                    ...props,
                    actionName: 'service-source',
                    oauthToken: SecretValue.secretsManager(githubTokenName),
                    output: sourceArtifact,
                    trigger: GitHubTrigger.WEBHOOK
                })
            ]
        });

        const project = new Project(this, 'DemoProject', {
            projectName: 'demo-project',
            environment: {
                privileged: true
            },
            environmentVariables: {
                IMAGE_REPO_NAME: {value: props.ecrRepository.repositoryName},
                AWS_ACCOUNT_ID: {value: scope.account},
                AWS_DEFAULT_REGION: {value: scope.region}
            },
            source: new CodePipelineSource()
        });

        props.ecrRepository.grantPullPush(project.grantPrincipal);
        pipeline.addStage({
            stageName: 'build',
            actions: [
                new CodeBuildAction({
                    actionName: 'build',
                    input: sourceArtifact,
                    project: project
                })
            ]
        });
    }
}
