import { Construct } from '@aws-cdk/core'
import { Artifact } from '@aws-cdk/aws-codepipeline'
import { BuildSpec, Project } from '@aws-cdk/aws-codebuild'
import { CodePipelineSource } from '@aws-cdk/aws-codebuild/lib/codepipeline-source'
import { CodeBuildAction } from '@aws-cdk/aws-codepipeline-actions'

export class CDKSynthPipelineAction {
  public buildOutputArtifact: Artifact
  public codeBuildAction: CodeBuildAction

  constructor(scope: Construct, projectPrefix: string, cdkArtifact: Artifact) {
    const project = new Project(scope, `${projectPrefix.replace('-', '')}CdkSynthProject`, {
      projectName: `${projectPrefix}-build-project`,
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
        },
        cache: {
          paths: [
            'node_modules/**/*'
          ]
        }
      })
    })

    this.buildOutputArtifact = new Artifact()
    this.codeBuildAction = new CodeBuildAction({
      actionName: 'build',
      input: cdkArtifact,
      project: project,
      outputs: [this.buildOutputArtifact]
    })
  }
}
