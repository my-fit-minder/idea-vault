// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

import { getSupabaseAdmin } from "../src/clients/supabaseClient.js";
import { ideasService } from "../src/services/ideasService.js";
import type { CreateIdeaInput, Idea } from "@idea-vault/shared";

// Sample data for generating random ideas
const sampleTitles = [
  "Revolutionary Mobile App",
  "Sustainable Energy Solution",
  "AI-Powered Learning Platform",
  "Community Garden Network",
  "Virtual Reality Fitness App",
  "Blockchain Voting System",
  "Smart Home Automation",
  "Eco-Friendly Packaging",
  "Personal Finance Tracker",
  "Social Media Analytics Tool",
  "Online Course Marketplace",
  "Food Delivery Optimization",
  "Mental Health Support App",
  "Renewable Energy Tracker",
  "Collaborative Workspace Platform",
  "Pet Care Service Network",
  "Language Learning Game",
  "Sustainable Fashion Marketplace",
  "Home Renovation Planner",
  "Event Planning Platform",
  "Music Discovery App",
  "Travel Itinerary Builder",
  "Fitness Challenge Platform",
  "Recipe Sharing Community",
  "Local Business Directory",
  "Skill Exchange Network",
  "Book Recommendation Engine",
  "Art Portfolio Platform",
  "Crowdfunding Platform",
  "Job Matching Service",
  "Weather-Based Activity Planner",
  "Plant Care Assistant",
  "Budget Meal Planner",
  "Study Group Finder",
  "Freelance Project Board",
  "Neighborhood Watch App",
  "Sustainable Transportation",
  "Digital Detox Challenge",
  "Creative Writing Platform",
  "Local Food Co-op",
  "Time Management Tool",
  "Hobby Exchange Network",
  "Elderly Care Service",
  "Student Loan Calculator",
  "Carbon Footprint Tracker",
  "Local News Aggregator",
  "Skill-Based Dating App",
  "Volunteer Opportunity Finder",
  "Sustainable Living Guide",
  "Personal Development Tracker",
];

const sampleContent = [
  "A platform that connects users with similar interests and goals.",
  "An innovative solution to reduce waste and promote sustainability.",
  "Using technology to solve everyday problems more efficiently.",
  "Building a community around shared values and interests.",
  "Creating tools that help people achieve their personal goals.",
  "Leveraging data to make better decisions and improve outcomes.",
  "A service that makes complex tasks simple and accessible.",
  "Connecting people with resources they need to succeed.",
  "An app that helps users track and improve their habits.",
  "A platform for sharing knowledge and learning from others.",
  "Using automation to save time and reduce manual work.",
  "Creating experiences that bring people together.",
  "A tool that helps users make informed decisions.",
  "Building something that makes a positive impact on society.",
  "An innovative approach to solving traditional problems.",
  "A service that adapts to individual user needs.",
  "Creating value through collaboration and community.",
  "An app that simplifies complex processes.",
  "A platform that empowers users to achieve more.",
  "Using design thinking to create better user experiences.",
];

const sampleTags = [
  "technology",
  "sustainability",
  "health",
  "education",
  "finance",
  "social",
  "productivity",
  "entertainment",
  "travel",
  "food",
  "fitness",
  "art",
  "music",
  "business",
  "community",
  "innovation",
  "design",
  "marketing",
  "development",
  "lifestyle",
];

/**
 * Get a random element from an array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random elements from an array
 */
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a random idea
 */
function generateRandomIdea(): CreateIdeaInput {
  const title = getRandomElement(sampleTitles);
  const content = Math.random() > 0.3 ? getRandomElement(sampleContent) : undefined;
  const tagCount = Math.floor(Math.random() * 3) + 1; // 1-3 tags
  const tags = getRandomElements(sampleTags, tagCount);

  return {
    title,
    content,
    tags,
  };
}

/**
 * Get the first user from the database (or use provided user_id)
 */
async function getUserId(userIdArg?: string): Promise<string> {
  if (userIdArg) {
    return userIdArg;
  }

  // Get the first user from auth.users
  const supabase = getSupabaseAdmin();
  const { data: usersData, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  if (!usersData || !usersData.users || usersData.users.length === 0) {
    throw new Error("No users found in the database. Please create a user first or provide a user_id as an argument.");
  }

  const firstUser = usersData.users[0];
  console.log(`Using user: ${firstUser.email || firstUser.id}`);
  return firstUser.id;
}

/**
 * Main function to generate random ideas
 */
async function main() {
  try {
    // Get user_id from command line argument or use first user
    const userIdArg = process.argv[2];
    const userId = await getUserId(userIdArg);

    console.log(`Generating 50 random ideas for user: ${userId}`);
    console.log("Note: AI report analysis will NOT be run on these ideas.\n");

    const createdIdeas: Idea[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 1; i <= 50; i++) {
      try {
        const ideaInput = generateRandomIdea();
        const idea = await ideasService.createIdea(ideaInput, userId);
        createdIdeas.push(idea);
        console.log(`✓ [${i}/50] Created: "${idea.title}"`);
      } catch (error: any) {
        errors.push({ index: i, error: error.message });
        console.error(`✗ [${i}/50] Failed: ${error.message}`);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`Successfully created ${createdIdeas.length} ideas`);
    if (errors.length > 0) {
      console.log(`Failed to create ${errors.length} ideas`);
    }
    console.log("=".repeat(50));
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
