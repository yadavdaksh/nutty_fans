import { squareClient } from './square';

/**
 * Ensures a Subscription Plan exists in Square Catalog for the specific tier and price.
 * Square Plans are "Catalog Objects". We can search for one by name/variation or creating a new one.
 * 
 * @param planName - e.g. "CreatorName - Silver Tier"
 * @param amount - Monthly price in dollars (e.g. 10.00)
 * @returns The Catalog Object ID of the plan
 */
export const getOrCreateSubscriptionPlan = async (
  planName: string, 
  amount: number
): Promise<string> => {
  try {
    // 1. Search for existing plan
    // We search by name.
    const searchRes = await squareClient.catalog.search({
      objectTypes: ['SUBSCRIPTION_PLAN'],
      includeRelatedObjects: true, // Need this to find variations? Actually variations are usually nested in response for PLANS
      query: {
        textQuery: {
           keywords: [planName]
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingPlan = (searchRes as any).result?.objects?.find((obj: any) => 
      obj.subscriptionPlanData?.name === planName
    );

    if (existingPlan) {
      // Return the first variation ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const variationId = existingPlan.subscriptionPlanData?.subscriptionPlanVariations?.[0]?.id;
      if (variationId) return variationId;
      
      // If plan exists but no variation (rare/broken state), we might need to create one. 
      // For now, assume it exists or we create a new plan logic below (simplification)
      console.warn("Found plan but no variation, proceeding to create new.");
    }

    // 2. Create new plan AND variation
    const amountMoney = BigInt(Math.round(amount * 100));
    const uniqueId = crypto.randomUUID();
    
    // Use batchUpsert to create both Plan and Variation
    const createRes = await squareClient.catalog.batchUpsert({
       idempotencyKey: uniqueId,
       batches: [{
         objects: [
           {
             type: 'SUBSCRIPTION_PLAN',
             id: `#plan_${uniqueId}`,
             subscriptionPlanData: {
               name: planName
             }
           },
           {
             type: 'SUBSCRIPTION_PLAN_VARIATION',
             id: `#var_${uniqueId}`,
             presentAtAllLocations: true,
             subscriptionPlanVariationData: {
               name: `${planName} Monthly`,
               subscriptionPlanId: `#plan_${uniqueId}`,
               phases: [
                 {
                   cadence: 'MONTHLY',
                   pricing: {
                     type: 'STATIC',
                     priceMoney: {
                       amount: amountMoney,
                       currency: 'USD'
                     }
                   }
                 }
               ] as any // Cast because SDK type might not match 'pricing' field perfectly yet
             }
           }
         ]
       }]
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idMappings = (createRes as any).result?.idMappings || (createRes as any).idMappings;
    // Find the real ID for our variation placeholder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const varMapping = idMappings?.find((m: any) => m.clientObjectId === `#var_${uniqueId}`);
    
    if (!varMapping?.objectId) {
       // Fallback: try to find in objects?
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       const createdVar = (createRes as any).result?.objects?.find((o: any) => o.type === 'SUBSCRIPTION_PLAN_VARIATION');
       if (createdVar?.id) return createdVar.id;

       throw new Error("Failed to retrieve created Variation ID");
    }
    
    return varMapping.objectId;

  } catch (error) {
    console.error("Error managing Square Plans:", error);
    throw error;
  }
};
