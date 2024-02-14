const { client } = require("../discordSetup");
const { mongo } = require("../mongoSetup");
const { MY_ACCOUNT, USERS_TO_OBSERVE } = require("../config.json");

const sendReports = async () => {
  await mongo.connect();

  const db = await mongo.db("DailyBugle");

  // Get the current date
  const currentDate = new Date();

  // Calculate the date 14 days ago
  const fourteenDaysAgo = new Date(currentDate);
  fourteenDaysAgo.setDate(currentDate.getDate() - 14);

  // get reports for last 2 weeks
  const reports = await db
    .collection("reports")
    .find({
      $and: [
        { name: { $in: USERS_TO_OBSERVE } },
        {
          timestamp: {
            $lte: Number(currentDate),
            $gte: Number(fourteenDaysAgo),
          },
        },
      ],
    })
    .toArray();

  const mappedUsersToObserve = USERS_TO_OBSERVE.reduce(
    (acc, name) => ({ ...acc, [name]: [] }),
    {}
  );

  // group by name
  const preparedReports = reports.reduce(
    (acc, report) => ({
      ...acc,
      [report.name]: [...acc[report.name], ...report.yesterday],
    }),
    mappedUsersToObserve
  );

  // get unified
  const unifiedReports = Object.entries(preparedReports).reduce(
    (acc, [name, reports]) => ({ ...acc, [name]: [...new Set(reports)] }),
    {}
  );

  // send to me
  client.users.fetch(MY_ACCOUNT, false).then((user) => {
    user.send(`Reports from ${new Date(
      fourteenDaysAgo
    ).toDateString()} to ${new Date(currentDate).toDateString()}: 
\`\`\`md
${Object.entries(unifiedReports).map(
  ([name, list]) => `[${name}]: ${list.join(", ")}\n`
)}
\`\`\``);
  });

  await mongo.close();
};

module.exports = {
  sendReports,
};
