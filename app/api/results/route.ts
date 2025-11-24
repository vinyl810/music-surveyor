import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const submissionsDir = path.join(process.cwd(), "submissions");

    // Check if directory exists
    if (!fs.existsSync(submissionsDir)) {
      return NextResponse.json({ submissions: [] });
    }

    // Read all JSON files
    const files = fs.readdirSync(submissionsDir).filter(file => file.endsWith('.json'));

    const submissions = files.map(file => {
      const filePath = path.join(submissionsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      return {
        filename: file,
        timestamp: file.includes('_') ? file.split('_').slice(-2).join('_').replace('.json', '') : 'unknown',
        data: data
      };
    });

    // Sort by timestamp descending (newest first)
    submissions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error reading submissions:", error);
    return NextResponse.json({ error: "Failed to load results" }, { status: 500 });
  }
}
