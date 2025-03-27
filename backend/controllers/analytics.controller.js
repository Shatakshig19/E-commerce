import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";

export const getAnalyticsData = async () => {
  // here req,res is not written because it is not the controller function but it is a function inside it

  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      $group: {
        //The _id field specifies the key for grouping. If set to null, it means all documents are grouped together.
        _id: null, //it groups all documents together
        totalSales: { $sum: 1 }, //1 means that one is assigned to each document and so 1 is added to get totaal number of sales
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        //Filters documents based on the createdAt field.
        //Ensures only orders within the specified startDate and endDate range are processed.
        //This converts the createdAt field (a Date object) into a string format, such as YYYY-MM-DD.
        //This allows grouping by the day.
        $match: {
          createdAt: {
            $gte: startDate, //greater than
            $lte: endDate, //less than
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } }, //ascending order sorting
    ]);

    //example of dailySalesData
    // [
    //     {   // lts say this is for monday and same type for tuesday and so on
    //     _id: "2024-08-19",
    //     sales: 12,
    //     revenue: 1452.02
    //     },
    // ]

    const dateArray = getDatesInRange(startDate, endDate);
    //console.log(dateArray);   // ['2024-08-18', '2024-08-19'....]

    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);

      return {
        date,
        sales: foundData?.sales || 0, //?. is chaining operator so that no errors are thrown but instead undefined is returned
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (error) {
    throw error;
  }
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
