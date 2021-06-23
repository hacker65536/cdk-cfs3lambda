import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3d from '@aws-cdk/aws-s3-deployment';
import * as cf from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as lambda from '@aws-cdk/aws-lambda';
import { CfnOutput } from '@aws-cdk/core';

export class CdkCfs3LambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const mys3 = new s3.Bucket(this, 's3cf');

    const mys3d = new s3d.BucketDeployment(this, 'uploadfile', {
      sources: [s3d.Source.asset('./assets')],
      destinationBucket: mys3,
    });

    const myFunc = new cf.experimental.EdgeFunction(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./func'),
    });

    const mycfwd = new cf.Distribution(this, 'mycfwd', {
      defaultBehavior: {
        origin: new origins.S3Origin(mys3),
        edgeLambdas: [
          {
            functionVersion: myFunc.currentVersion,
            eventType: cf.LambdaEdgeEventType.VIEWER_REQUEST,
          },
        ],
      },
    });

    new CfnOutput(this, 'mycfwddomain', {
      value: 'https://' + mycfwd.domainName,
    });
  }
}
