import { Artifact } from '@aws-cdk/aws-codepipeline'
import { IRole } from '@aws-cdk/aws-iam'
import { CloudFormationCreateReplaceChangeSetAction, CloudFormationExecuteChangeSetAction } from '@aws-cdk/aws-codepipeline-actions'
import { CloudFormationCapabilities } from '@aws-cdk/aws-cloudformation'
import { StageOptions } from '@aws-cdk/aws-codepipeline/lib/pipeline'

export function stackDeploymentStageOptions(stackName: string, inputArtifact: Artifact, deploymentRole: IRole): StageOptions {
    return {
        stageName: `${stackName}-deploy`,
        actions: [
            new CloudFormationCreateReplaceChangeSetAction({
                actionName: 'create-changeset',
                stackName,
                changeSetName: `${stackName}-changeset`,
                runOrder: 1,
                templatePath: inputArtifact.atPath(`${stackName}.template.json`),
                deploymentRole: deploymentRole,
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
    }
}
