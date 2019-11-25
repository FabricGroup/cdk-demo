import { Artifact } from '@aws-cdk/aws-codepipeline'
import { CloudFormationCreateReplaceChangeSetAction, CloudFormationExecuteChangeSetAction } from '@aws-cdk/aws-codepipeline-actions'
import { Role } from '@aws-cdk/aws-iam'
import { CdkBuildPipeline, CdkBuildPipelineProps } from './cdk-build-pipeline'
import { CloudFormationCapabilities } from '@aws-cdk/aws-cloudformation'
import { Construct} from '@aws-cdk/core'

export interface CdkDeployPipelineProps extends CdkBuildPipelineProps {
  deploymentRole: Role;
}

export class CdkDeployPipeline extends CdkBuildPipeline<CdkDeployPipelineProps> {
  constructor(scope: Construct, id: string, props: CdkDeployPipelineProps) {
    super(scope, id, {...props, gitBranch: 'master2'})
  }

  protected addStages(sourceArtifact: Artifact, props: CdkDeployPipelineProps): Artifact {
    const buildArtifact = super.addStages(sourceArtifact, props)
    this.addDeploymentStages(buildArtifact, props, 'cdk-deploy-stack')
    return buildArtifact
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
          runOrder: 1,
          templatePath: inputArtifact.atPath(serviceStackTemplateFile),
          deploymentRole: props.deploymentRole,
          adminPermissions: false,
          capabilities: [CloudFormationCapabilities.NAMED_IAM]
        }),
        new CloudFormationExecuteChangeSetAction({
          actionName: 'execute-changeset',
          stackName,
          changeSetName: `${stackName}-changeset`,
          runOrder: 2
        })
      ]
    })
  }
}
