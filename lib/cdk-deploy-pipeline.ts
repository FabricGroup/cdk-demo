import { Artifact } from '@aws-cdk/aws-codepipeline'
import { IRole, Role } from '@aws-cdk/aws-iam'
import { CdkBuildPipeline, CdkBuildPipelineProps } from './cdk-build-pipeline'
import { Construct } from '@aws-cdk/core'
import { stackDeploymentStageOptions } from './stages'

export interface CdkDeployPipelineProps extends CdkBuildPipelineProps {
  deploymentRole: Role;
}

export class CdkDeployPipeline extends CdkBuildPipeline<CdkDeployPipelineProps> {
  constructor(scope: Construct, id: string, props: CdkDeployPipelineProps) {
    super(scope, id, {...props, gitBranch: 'master2'})
  }

  protected addStages(sourceArtifact: Artifact, props: CdkDeployPipelineProps): Artifact {
    const buildArtifact = super.addStages(sourceArtifact, props)
    this.addDeploymentStages(buildArtifact, 'cdk-deploy-stack', props.deploymentRole)
    return buildArtifact
  }

  private addDeploymentStages(cdkBuildArtifact: Artifact, stackName: string, deploymentRole: IRole) {
    this.pipeline.addStage(stackDeploymentStageOptions(stackName, cdkBuildArtifact, deploymentRole))
  }
}
