import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline'
import { IRole, Role } from '@aws-cdk/aws-iam'
import { Construct, SecretValue } from '@aws-cdk/core'
import { GitHubSourceAction, GitHubTrigger } from '@aws-cdk/aws-codepipeline-actions'
import { CDKSynthPipelineAction } from './cdk-pipeline-action'
import { stackDeploymentStageOptions } from '../utils/stages'

export interface CdkDeployPipelineProps {
    deploymentRole: Role;
    cdkSource: {
        repo: string
        branch: string
        owner: string
        githubTokenName: string
    }
    serviceSetupStackNames: string[]
}

export class CdkDeployPipeline extends Construct {
    protected pipeline: Pipeline

    constructor(private scope: Construct, id: string, props: CdkDeployPipelineProps) {
        super(scope, id)

        this.pipeline = new Pipeline(this, 'Pipeline', {
            pipelineName: `cdk-deployment-pipeline`,
            restartExecutionOnUpdate: true
        })

        this.addStages(props)
    }

    private addStages(props: CdkDeployPipelineProps) {
        const cdkArtifact = this.addSourceStage(props)
        const cdkSynthArtifact = this.addSynthStage(cdkArtifact)

        this.addDeploymentStages(cdkSynthArtifact, 'cdk-deploy-stack', props.deploymentRole)
        props.serviceSetupStackNames.forEach(serviceSetupStackName =>
          this.addDeploymentStages(cdkSynthArtifact, serviceSetupStackName, props.deploymentRole))
    }

    private addSourceStage(props: CdkDeployPipelineProps): Artifact {
        const cdkArtifact = new Artifact('cdkSource')

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
        return cdkArtifact
    }

    private addSynthStage(cdkArtifact: Artifact): Artifact {
        const cdkSynthAction = new CDKSynthPipelineAction(this.scope, 'cdk-deploy', cdkArtifact)

        this.pipeline.addStage({
            stageName: 'build',
            actions: [cdkSynthAction.codeBuildAction]
        })
        return cdkSynthAction.buildOutputArtifact
    }

    private addDeploymentStages(cdkBuildArtifact: Artifact, stackName: string, deploymentRole: IRole) {
        this.pipeline.addStage(stackDeploymentStageOptions(stackName, cdkBuildArtifact, deploymentRole))
    }
}
