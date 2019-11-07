import cdk = require("@aws-cdk/core");
import {Tag} from "@aws-cdk/core";
import {DemoPipeline} from "./demo-pipeline";

export class CdkStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.node.applyAspect(new Tag('meetup', 'true'));

        new DemoPipeline(this, 'DemoPipeline', {
            branch: 'master',
            repo: 'goose',
            owner: 'FabricGroup'
        });
    }
}
