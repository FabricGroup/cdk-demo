import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline'
import { IRole, Role } from '@aws-cdk/aws-iam'
import { Construct, SecretValue } from '@aws-cdk/core'
import { stackDeploymentStageOptions } from './stages'
import { GitHubSourceAction, GitHubTrigger } from '@aws-cdk/aws-codepipeline-actions'
import { CDKSynthPipelineAction } from './cdkPipelineAction'

export interface CdkDeployPipelineProps {
    deploymentRole: Role;
    pipelinePrefix: string
    cdkSource: {
        repo: string
        branch: string
        owner: string
        githubTokenName: string
    }
}

export class CdkDeployPipeline extends Construct {
    protected pipeline: Pipeline

    constructor(private scope: Construct, id: string, props: CdkDeployPipelineProps) {
        super(scope, id)

        this.pipeline = new Pipeline(this, 'Pipeline', {
            pipelineName: `${props.pipelinePrefix}-pipeline`,
            restartExecutionOnUpdate: true
        })

        const cdkArtifact = new Artifact('cdkSource')
        this.addStages(cdkArtifact, props)
    }

    protected addStages(cdkArtifact: Artifact, props: CdkDeployPipelineProps) {
        this.pipeline.addStage({
            stageName: 'cdk-source',
            actions: [
                new GitHubSourceAction({
                    ...props.cdkSource,
                    actionName: 'github-cdk-source',
                    oauthToken: SecretValue.secretsManager(props.cdkSource.githubTokenName),
                    output: cdkArtifact,
                    trigger: GitHubTrigger.WEBHOOK
                })
            ]
        })

        const cdkSynthAction = new CDKSynthPipelineAction(this.scope, props.pipelinePrefix, cdkArtifact)

        this.pipeline.addStage({
            stageName: 'build',
            actions: [cdkSynthAction.codeBuildAction]
        })

        this.addDeploymentStages(cdkSynthAction.buildOutputArtifact, 'cdk-deploy-stack', props.deploymentRole)
    }

    private addDeploymentStages(cdkBuildArtifact: Artifact, stackName: string, deploymentRole: IRole) {
        this.pipeline.addStage(stackDeploymentStageOptions(stackName, cdkBuildArtifact, deploymentRole))
    }
}
