import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline'
import { CodeBuildAction, GitHubSourceAction, GitHubTrigger } from '@aws-cdk/aws-codepipeline-actions'
import { Construct, SecretValue, Stack } from '@aws-cdk/core'
import { BuildSpec, Project } from '@aws-cdk/aws-codebuild'
import { CodePipelineSource } from '@aws-cdk/aws-codebuild/lib/codepipeline-source'

export interface CdkBuildPipelineProps {
  pipelineName: string
  gitBranch?: string
}

export class CdkBuildPipeline<TProps extends CdkBuildPipelineProps> extends Construct {
  protected pipeline: Pipeline

  constructor(scope: Stack, id: string, props: TProps) {
    super(scope, id)

    this.pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: props.pipelineName
    })

    const cdkArtifact = new Artifact('cdkSource')
    this.addStages(cdkArtifact, props)
  }

  protected addStages(cdkArtifact: Artifact, props: TProps) {
    this.pipeline.addStage({
      stageName: 'service-source',
      actions: [
        new GitHubSourceAction({
          repo: 'cdk-demo',
          owner: 'FabricGroup',
          branch: props.gitBranch ?? 'development',
          actionName: 'github-cdk-source',
          oauthToken: SecretValue.secretsManager('cdk-demo/github/goose-token'),
          output: cdkArtifact,
          trigger: GitHubTrigger.WEBHOOK
        })
      ]
    })

    this.addBuildStage(cdkArtifact)
  }

  private addBuildStage(cdkArtifact: Artifact) {
    const project = new Project(this, 'CdkUpdateProject', {
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
              'yarn test',
              'yarn cdk synth'
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
    })

    const buildOutputArtifact = new Artifact()
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
    })
    return buildOutputArtifact
  }
}
