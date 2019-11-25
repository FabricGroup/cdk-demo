import {BaseStack} from './base-stack';
import {Construct, StackProps} from '@aws-cdk/core';
import {Cluster} from "@aws-cdk/aws-ecs";

export class ServiceDeploymentStack extends BaseStack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        new Cluster(this, "DemoCluster")


        // new ApplicationLoadBalancedFargateService(this, "FargateResource", {
        //
        // })

    }

}
