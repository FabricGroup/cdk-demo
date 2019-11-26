import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { CfnOutput, Construct, StackProps } from '@aws-cdk/core'
import { BaseStack } from './base-stack'

export class InfraStack extends BaseStack {
    public deploymentRole: Role

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        this.deploymentRole = new Role(this, 'CdkDeploymentRole', {
            roleName: 'cdk-deployer',
            assumedBy: new ServicePrincipal('cloudformation.amazonaws.com')
        })
        this.deploymentRole.addToPolicy(new PolicyStatement({actions: ['*'], resources: ['*']}))
        this.deploymentRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSCloudFormationFullAccess'))

        new CfnOutput(this, 'DeploymentRole', {value: this.deploymentRole.roleArn})
    }
}
