export async function makeOrderVariantBody(orderVariant, order_status_trackers) {
  try {
    console.log("entered in makeOrderVariant");
    if (orderVariant.ShipRocketOrderItemId) {
      const trackingData = getShipRocketTracking();

      const orderVariantResponse = {
        orderVariant: orderVariant,
        orderTrack: trackingData.scans,
      };
      return orderVariantResponse;
    } else if (orderVariant.CustomCourierId) {
      const orderVariantResponse = {
        orderVariant: orderVariant,
        orderStatus: order_status_trackers,
      };
      return orderVariantResponse;
    } else {
      const orderVariantResponse = {
        orderVariant: orderVariant,
        orderStatus: null,
      };
      return orderVariantResponse;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const getShipRocketTracking = () => {
  try {
    const trackingResponse = {
      awb: 59629792084,
      current_status: "Delivered",
      order_id: "13905312",
      current_timestamp: "2021-07-02 16:41:59",
      etd: "2021-07-02 16:41:59",
      current_status_id: 7,
      shipment_status: "Delivered",
      shipment_status_id: 7,
      channel_order_id: "enter your channel order id",
      channel: "enter your channel name",
      courier_name: "enter courier_name",
      scans: [
        {
          date: "2019-06-25 12:08:00",
          activity: "SHIPMENT DELIVERED",
          location: "PATIALA",
        },
        {
          date: "2019-06-25 12:06:00",
          activity: "NECESSARY CHARGES PENDING FROM CONSIGNEE",
          location: "PATIALA",
        },
        {
          date: "2019-06-25 10:18:00",
          activity: "SHIPMENT OUT FOR DELIVERY",
          location: "PATIALA",
        },
        {
          date: "2019-06-25 09:40:00",
          activity: "SHIPMENT ARRIVED",
          location: "PATIALA",
        },
        {
          date: "2019-06-25 07:32:00",
          activity: "SHIPMENT FURTHER CONNECTED",
          location: "AMBALA AIR HUB",
        },
        {
          date: "2019-06-25 07:03:00",
          activity: "SHIPMENT ARRIVED AT HUB",
          location: "AMBALA AIR HUB",
        },
        {
          date: "2019-06-25 00:45:00",
          activity: "SHIPMENT FURTHER CONNECTED",
          location: "KAPASHERA HUB",
        },
        {
          date: "2019-06-25 00:20:00",
          activity: "SHIPMENT ARRIVED AT HUB",
          location: "KAPASHERA HUB",
        },
        {
          date: "2019-06-24 23:17:00",
          activity: "SHIPMENT FURTHER CONNECTED",
          location: "COD PROCESSING CENTRE I",
        },
        {
          date: "2019-06-24 21:14:00",
          activity: "SHIPMENT ARRIVED",
          location: "COD PROCESSING CENTRE I",
        },
        {
          date: "2019-06-24 18:56:00",
          activity: "SHIPMENT PICKED UP",
          location: "COD PROCESSING CENTRE I",
        },
      ],
    };

    return trackingResponse;
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};
