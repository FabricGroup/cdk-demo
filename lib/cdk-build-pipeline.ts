import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline'
import { GitHubSourceAction, GitHubTrigger } from '@aws-cdk/aws-codepipeline-actions'
import { Construct, SecretValue } from '@aws-cdk/core'
import { CDKSynthPipelineAction } from './cdkPipelineAction'

export interface CdkBuildPipelineProps {
  pipelinePrefix: string
  cdkSource: {
    repo: string
    branch: string
    owner: string
    githubTokenName: string
  }
}

export class CdkBuildPipeline<TProps extends CdkBuildPipelineProps> extends Construct {
  protected pipeline: Pipeline

  constructor(private scope: Construct, id: string, props: TProps) {
    super(scope, id)

    this.pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: `${props.pipelinePrefix}-pipeline`,
      restartExecutionOnUpdate: true
    })

    const cdkArtifact = new Artifact('cdkSource')
    this.addStages(cdkArtifact, props)
  }

  protected addStages(cdkArtifact: Artifact, props: TProps): Artifact {
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

    return cdkSynthAction.buildOutputArtifact
  }
}
