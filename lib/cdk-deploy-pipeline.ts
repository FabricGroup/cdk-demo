import cdk = require('@aws-cdk/core')
import { Artifact } from '@aws-cdk/aws-codepipeline'
import { CloudFormationCreateReplaceChangeSetAction, CloudFormationExecuteChangeSetAction } from '@aws-cdk/aws-codepipeline-actions'
import { Role } from '@aws-cdk/aws-iam'
import { CdkBuildPipeline, CdkBuildPipelineProps } from './cdk-build-pipeline'

export interface CdkDeployPipelineProps extends CdkBuildPipelineProps {
  deploymentRole: Role;
  serviceStackName: string
}

export class CdkDeployPipeline extends CdkBuildPipeline<CdkDeployPipelineProps> {
  constructor(scope: cdk.Stack, id: string, props: CdkDeployPipelineProps) {
    super(scope, id, {...props, gitBranch: 'master'})
  }

  protected addStages(buildOutputArtifact: Artifact, props: CdkDeployPipelineProps) {
    super.addStages(buildOutputArtifact, props)
    this.addDeploymentStages(buildOutputArtifact, props, 'cdk-deploy-stack')
    this.addDeploymentStages(buildOutputArtifact, props, props.serviceStackName)
  }

  private addDeploymentStages(inputArtifact: Artifact, props: CdkDeployPipelineProps, stackName: string) {
    const serviceStackTemplateFile = `${stackName}.template.json`
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
    })
  }
}
