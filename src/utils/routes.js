import app from "../../server.js";

import activity_log from "../api/activity_log/routes/activity_log.js";
import address from "../api/address/routes/address.js";
import admin from "../api/admin/routes/admin.js";
import banner from "../api/banner/routes/banner.js";
import bulk_pricing from "../api/bulk_pricing/routes/bulk_pricing.js";
import campaign from "../api/campaign/routes/campaign.js";
import cart from "../api/cart/routes/cart.js";
import category from "../api/category/routes/category.js";
import collection from "../api/collection/routes/collection.js";
import collection_static from "../api/collection_static/routes/collection_static.js";
import custom_courier from "../api/custom_courier/routes/custom_courier.js";
import free_plan from "../api/free_plan/routes/free_plan.js";
import global from "../api/global/routes/global.js";
import global_brand from "../api/global_brand/routes/global_brand.js";
import lead from "../api/lead/routes/lead.js";
import order from "../api/order/routes/order.js";
import order_variant from "../api/order_variant/routes/order_variant.js";
import permission from "../api/permission/routes/permission.js";
import plan_metrics from "../api/plan_metrics/routes/plan_metrics.js";
import product from "../api/product/routes/product.js";
import product_metrics from "../api/product_metrics/routes/product_metrics.js";
import privacy_policy from "../api/privacy_policy/routes/privacy_policy.js";
import role from "../api/role/routes/role.js";
import server_subscription from "../api/server_subscription/routes/server_subscription.js";
import ship_rocket_orderitem from "../api/ship_rocket_orderitem/routes/ship_rocket_orderitem.js";
import payment_log from "../api/payment_log/routes/payment_log.js";
import plan from "../api/plan/routes/plan.js";
import policy from "../api/policy/routes/policy.js";
import setting from "../api/setting/routes/setting.js";
import subscription from "../api/subscription/routes/subscription.js";
import support_ticket from "../api/support_ticket/routes/support_ticket.js";
import user from "../api/user/routes/user.js";
import sub_category from "../api/sub_category/routes/sub_category.js";
import tag from "../api/tag/routes/tag.js";
import transaction from "../api/transaction/routes/transaction.js";
import tutorial from "../api/tutorial/routes/tutorial.js";
import upload from "../api/upload/routes/upload.js";
import variant from "../api/variant/routes/variant.js";
import wallet from "../api/wallet/routes/wallet.js";
import ship_rocket_order from "../api/ship_rocket_order/routes/ship_rocket_order.js";
import ship_rocket_return from "../api/ship_rocket_return/routes/ship_rocket_return.js";
import notification from "../api/notification/routes/notification.js";
import product_policy from "../api/product_policy/routes/product_policy.js";
import promotional_message from "../api/promotional_message/routes/promotional_message.js";
import testimonial from "../api/testimonial/routes/testimonial.js";
import story from "../api/story/routes/story.js";
import return_order from "../api/return_order/routes/return_order.js";
import product_review from "../api/product_review/routes/product_review.js";
import marquee from "../api/marquee/routes/marquee.js";
import account_details from "../api/account-details/routes/account-detail.js";
import reseller from "../api/reseller/routes/reseller.js";
import reseller_banner from "../api/reseller_banner/routes/reseller_banner.js";
import reseller_category from "../api/reseller_category/routes/reseller_category.js";
import store_global from "../api/store_global/routes/store_global.js";
import store_global_brand from "../api/store_global_brand/routes/store_global_brand.js";
activity_log(app);
address(app);
admin(app);
banner(app);
bulk_pricing(app);
campaign(app);
cart(app);
category(app);
collection(app);
collection_static(app);
custom_courier(app);
free_plan(app);
global(app);
global_brand(app);
lead(app);
order(app);
order_variant(app);
permission(app);
plan_metrics(app);
product(app);
product_metrics(app);
privacy_policy(app);
role(app);
server_subscription(app);
ship_rocket_orderitem(app);
payment_log(app);
plan(app);
policy(app);
setting(app);
subscription(app);
support_ticket(app);
user(app);
sub_category(app);
tag(app);
transaction(app);
tutorial(app);
upload(app);
variant(app);
wallet(app);
ship_rocket_order(app);
ship_rocket_return(app);
notification(app);
product_policy(app);
promotional_message(app);
testimonial(app);
story(app);
return_order(app);
product_review(app);
marquee(app);
account_details(app);
reseller(app);
reseller_banner(app);
reseller_category(app);
store_global(app);
store_global_brand(app);
// const fs =  from
// const path =  from

// let routes = [];
// async function registerRoutes(name) {
//     const apiDirectory = path.resolve("./src/api")
//     const apiFolders = await fs.readdirSync(apiDirectory)
//     console.log(apiFolders)
//     let folders = [];
//     apiFolders.map((item) => {
//         folders.push(path.join(apiDirectory, item, "routes"))
//     })
//     for (const folder of folders) {
//         const files = fs.readdirSync(folder)
//         console.log(folder)
//         for (const file of files) {
//             // console.log(folder.concat(file))
//             // console.log(folder)
//             const pathh = ".." + folder.split("src")[1].concat(`\\`, file)
//             console.log(pathh.replaceAll("\\", "/"))
//             const module =  from pathh.replaceAl
//             routes.push(module)
//         }
//     }
//     // console.log(routes)
// }
// registerRoutes()
