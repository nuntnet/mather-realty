import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const APPOINTMENTS_DB_ID = "36a604e0d99a80cc8c6fd030c325a971";

async function setupAppointmentsDatabase() {
  console.log("Setting up Appointments database properties...");

  try {
    // Add properties to the database
    await notion.databases.update({
      database_id: APPOINTMENTS_DB_ID,
      title: [{ type: "text", text: { content: "Appointments" } }],
      properties: {
        // Rename Name to Customer Name (Title property)
        "Name": { name: "Customer Name" },

        // Type of appointment
        "Type": {
          select: {
            options: [
              { name: "test_drive", color: "blue" },
              { name: "service", color: "green" },
              { name: "body_paint", color: "orange" },
              { name: "insurance_quote", color: "purple" },
            ],
          },
        },

        // Status
        "Status": {
          select: {
            options: [
              { name: "pending", color: "yellow" },
              { name: "confirmed", color: "blue" },
              { name: "completed", color: "green" },
              { name: "cancelled", color: "red" },
            ],
          },
        },

        // Contact info
        "Customer Phone": { phone_number: {} },
        "Customer Email": { email: {} },

        // Appointment details
        "Car Model": { rich_text: {} },
        "Branch": { rich_text: {} },
        "Preferred Date": { date: {} },
        "Preferred Time": { rich_text: {} },
        "Notes": { rich_text: {} },

        // For body_paint type
        "Damage Description": { rich_text: {} },

        // For insurance_quote type
        "Insurance Company": { rich_text: {} },
        "Vehicle Registration": { rich_text: {} },
        "Coverage Type": { rich_text: {} },

        // Metadata
        "Submitted At": { date: {} },
      },
    });

    console.log("✅ Appointments database updated successfully!");

    // Verify the update
    const db = await notion.databases.retrieve({ database_id: APPOINTMENTS_DB_ID });
    console.log("\nProperties added:");
    Object.keys(db.properties).forEach((prop) => {
      console.log(`  - ${prop}: ${db.properties[prop].type}`);
    });

  } catch (error) {
    console.error("❌ Error updating database:", error);
  }
}

setupAppointmentsDatabase();
