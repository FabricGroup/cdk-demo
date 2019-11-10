import {BaseStack} from './base-stack';
import {Construct, StackProps} from '@aws-cdk/core';
import {Role} from '@aws-cdk/aws-iam';
import {CdkDeployPipeline} from './cdk-deploy-pipeline';

interface CdkDeployStackProps extends StackProps {
    serviceStackName: string;
    deploymentRole: Role
}

export class CdkDeployStack extends BaseStack {
    constructor(scope: Construct, id: string, props: CdkDeployStackProps) {
        super(scope, id, props);

        new CdkDeployPipeline(this, 'cdkPipeline', {
            serviceStackName: props.serviceStackName,
            deploymentRole: props.deploymentRole
        });
    }
}
