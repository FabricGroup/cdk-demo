import cdk = require('@aws-cdk/core')
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline'
import { CodeBuildAction, GitHubSourceAction, GitHubTrigger } from '@aws-cdk/aws-codepipeline-actions'
import { Construct, Fn, SecretValue } from '@aws-cdk/core'
import { Project } from '@aws-cdk/aws-codebuild'
import { CodePipelineSource } from '@aws-cdk/aws-codebuild/lib/codepipeline-source'
import { Repository } from '@aws-cdk/aws-ecr'
import { IRole, Role } from '@aws-cdk/aws-iam'
import { CDKSynthPipelineAction } from './cdkPipelineAction'
import { stackDeploymentStage } from './stages'

export interface ServiceDeploymentPipelineProps {
  repo: string
  owner: string
  branch: string,
  githubTokenName: string;
  ecrRepository: Repository,
  serviceStackName: string;
  deploymentRole: Role
}

export class ServiceDeploymentPipeline extends cdk.Construct {
  private pipeline: Pipeline

  constructor(scope: Construct, id: string, props: ServiceDeploymentPipelineProps) {
    super(scope, id)

    this.pipeline = new Pipeline(this, 'DemoCodePipeline', {
      pipelineName: `${props.serviceStackName}-pipeline`
    })

    const sourceArtifact = new Artifact('serviceSource')
    const cdkArtifact = new Artifact('cdkSource')
    const githubTokenName = props.githubTokenName
    this.pipeline.addStage({
      stageName: 'service-source',
      actions: [
        new GitHubSourceAction({
          ...props,
          actionName: 'service-source',
          oauthToken: SecretValue.secretsManager(githubTokenName),
          output: sourceArtifact,
          trigger: GitHubTrigger.WEBHOOK
        }),
        new GitHubSourceAction({
          repo: 'cdk-demo',
          owner: 'FabricGroup',
          branch: 'master',
          actionName: 'github-cdk-source',
          oauthToken: SecretValue.secretsManager(githubTokenName),
          output: cdkArtifact,
          trigger: GitHubTrigger.WEBHOOK
        })
      ]
    })
    this.addBuildStage(props, sourceArtifact)
    const cdkBuildArtifact = this.addCdkBuildStage(scope, props, cdkArtifact)
    this.addDeploymentStage(cdkBuildArtifact, props.serviceStackName, props.deploymentRole)
  }

  private addBuildStage(props: ServiceDeploymentPipelineProps, sourceArtifact: Artifact) {
    const project = new Project(this, 'DemoProject', {
      projectName: `${props.serviceStackName}-project`,
      environment: {
        privileged: true
      },
      environmentVariables: {
        IMAGE_REPO_NAME: {value: props.ecrRepository.repositoryName},
        AWS_ACCOUNT_ID: {value: Fn.sub('${AWS::AccountId}')},
        AWS_DEFAULT_REGION: {value: Fn.sub('${AWS::Region}')}
      },
      source: new CodePipelineSource()
    })

    props.ecrRepository.grantPullPush(project.grantPrincipal)
    this.pipeline.addStage({
      stageName: 'build',
      actions: [
        new CodeBuildAction({
          actionName: 'build',
          input: sourceArtifact,
          project: project
        })
      ]
    })
  }

  private addCdkBuildStage(scope: Construct, props: ServiceDeploymentPipelineProps, cdkArtifact: Artifact): Artifact {
    const cdkSynthAction = new CDKSynthPipelineAction(scope, `${props.serviceStackName}-cdk`, cdkArtifact)
    this.pipeline.addStage({
      stageName: 'cdk-build',
      actions: [cdkSynthAction.codeBuildAction]
    })
    return cdkSynthAction.buildOutputArtifact
  }

  private addDeploymentStage(inputArtifact: Artifact, stackName: string, deploymentRole: IRole) {
    this.pipeline.addStage(stackDeploymentStage(stackName, inputArtifact, deploymentRole))
  }
}
