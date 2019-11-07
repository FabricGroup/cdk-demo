import cdk = require("@aws-cdk/core");
import {Artifact, Pipeline} from "@aws-cdk/aws-codepipeline";
import {CodeBuildAction, GitHubSourceAction, GitHubTrigger} from "@aws-cdk/aws-codepipeline-actions";
import {SecretValue} from "@aws-cdk/core";
import {Project} from "@aws-cdk/aws-codebuild";
import {CodePipelineSource} from "@aws-cdk/aws-codebuild/lib/codepipeline-source";

export interface DemoPipelineProps {
    repo: string
    owner: string
    branch: string
}

export class DemoPipeline extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: DemoPipelineProps) {
        super(scope, id);

        const pipeline = new Pipeline(this, 'DemoCodePipeline', {
            pipelineName: 'container-demo-pipeline',
        });

        const sourceArtifact = new Artifact();
        pipeline.addStage({
            stageName: 'github-source',
            actions: [
                new GitHubSourceAction({
                    ...props,
                    actionName: 'github-source',
                    oauthToken: SecretValue.secretsManager('cdk-demo/github/goose-token'),
                    output: sourceArtifact,
                    trigger: GitHubTrigger.WEBHOOK
                })
            ]
        });

        pipeline.addStage({
            stageName: 'build',
            actions: [
                new CodeBuildAction({
                    actionName: 'build',
                    input: sourceArtifact,
                    project: new Project(this, 'DemoProject', {
                        source: new CodePipelineSource()
                    })
                })
            ]
        });
    }
}
