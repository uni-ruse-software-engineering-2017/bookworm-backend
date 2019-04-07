require("dotenv-override").config({ override: true });

import subscriptionService from "../modules/commerce/subscription.service";
import database from "../services/database";

(async () => {
  await database.authenticate();
  try {
    let renewed = 0;
    const expiring = await subscriptionService.getExpiringSubscriptions();

    for (const expiringSubscription of expiring) {
      const result = await subscriptionService
        .renewSubscription(expiringSubscription)
        .catch(error => {
          console.error(error);

          // if the renewall fails, cancel the subscription
          return subscriptionService.unsubscribeCustomer(
            expiringSubscription.user
          );
        });

      if (result) {
        renewed += 1;
      }
    }

    console.log(`Renewed ${renewed}/${expiring.length} subscriptions.`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
