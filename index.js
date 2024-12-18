module.exports = {
    name: "insomnia-plugin-openrtb-validator",
    displayName: "OpenRTB Validator",
    description: "Plugin to validate mandatory and optional fields in OpenRTB bid responses",
  
    responseHooks: [
      async (context) => {
        console.log("🚀 Starting OpenRTB validation...");
  
        // get response status
        const statusCode = context.response.getStatusCode();
  
        
        if (statusCode === 204) {
          console.log("ℹ️ No Content (204): No bid present");
          return; // stop 
        } else if (statusCode >= 400) {
          console.error(`❌ HTTP Error ${statusCode}: Unable to process the response.`);
          context.app.alert("HTTP Error", `Request failed with status code ${statusCode}`);
          return; // stop 
        } else if (statusCode >= 300) {
          console.warn(`⚠️ HTTP Redirect ${statusCode}: Check if this is expected.`);
        } else {
          console.log(`✅ HTTP Status ${statusCode}: Proceeding with validation.`);
        }
  
        // get repsonse body
        const responseBody = context.response.getBody();
        let responseJson;
  
        try {
          responseJson = JSON.parse(responseBody);
          console.log("✅ Response JSON parsed successfully.");
        } catch (err) {
          console.error("❌ Response is not valid JSON:", err);
          context.app.alert("Validation Error", "Response is not valid JSON.");
          return;
        }
  
        const errors = [];
        const warnings = [];
        const processLogs = [];
  
        // mandatory fields checking
        console.log("🕵️ Checking mandatory fields...");
  
        // cur
        if (!responseJson.cur) {
          errors.push("Missing required field: 'cur' (Bid currency).");
          processLogs.push("❌ Field 'cur': NOT FOUND");
        } else {
          processLogs.push("✅ Field 'cur': OK");
        }
  
        // seatbid
        if (
          !responseJson.seatbid ||
          !Array.isArray(responseJson.seatbid) ||
          !responseJson.seatbid.length
        ) {
          errors.push("Missing required field: 'seatbid' (Seat Bid Array).");
          processLogs.push("❌ Field 'seatbid': NOT FOUND");
        } else {
          processLogs.push("✅ Field 'seatbid': OK");
  
          const seatbid = responseJson.seatbid[0];
  
          if (!seatbid.bid || !Array.isArray(seatbid.bid) || !seatbid.bid.length) {
            errors.push("Missing required field: 'seatbid.bid' (Bid Array).");
            processLogs.push("❌ Field 'seatbid.bid': NOT FOUND");
          } else {
            processLogs.push("✅ Field 'seatbid.bid': OK");
  
            const bid = seatbid.bid[0];
  
            // a domain
            if (!bid.adomain || !Array.isArray(bid.adomain) || !bid.adomain.length) {
              errors.push(
                "Missing required field: 'seatbid.bid.adomain' (Advertiser Domain)."
              );
              processLogs.push("❌ Field 'seatbid.bid.adomain': NOT FOUND");
            } else {
              processLogs.push("✅ Field 'seatbid.bid.adomain': OK");
            }
          }
        }
  
        // recommended fields
        console.log("📋 Checking optional fields...");
  
        const seatbid = responseJson.seatbid?.[0] || {};
        const bid = seatbid.bid?.[0] || {};
  
        // seatbid.seat
        if (!seatbid.seat) {
          warnings.push("Missing optional field: 'seatbid.seat' (Seat ID).");
          processLogs.push("⚠️ Field 'seatbid.seat': NOT FOUND");
        } else {
          processLogs.push("✅ Field 'seatbid.seat': OK");
        }
  
        // At least one recommended fiedls
        if (!bid.cid && !bid.crid && !bid.iurl && !bid.adid) {
          warnings.push(
            "Missing at least one of the recommended fields: 'seatbid.bid.cid', 'seatbid.bid.crid', 'seatbid.bid.iurl', or 'seatbid.bid.adid'."
          );
          processLogs.push(
            "⚠️ Recommended fields ('cid', 'crid', 'iurl', 'adid'): NOT FOUND"
          );
        } else {
          processLogs.push("✅ At least one recommended field: OK");
        }
  
        // results logs
        console.log("🔍 Validation Process Logs:");
        processLogs.forEach((log) => console.log(log));
  
        if (errors.length > 0) {
          console.error("❌ Validation Errors:", errors);
          context.app.alert("Validation Errors", errors.join("\n"));
        } else {
          console.log("🎉 OpenRTB Validation Passed.");
        }
  
        if (warnings.length > 0) {
          console.warn("⚠️ Validation Warnings:", warnings);
          context.app.alert("Validation Warnings", warnings.join("\n"));
        }
      },
    ],
  };