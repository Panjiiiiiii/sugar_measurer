import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function GET() {
  try {
    const owners = await prisma.owner.findMany();
    return Response.json({
      message: "Data fetched successfully",
      data: owners,
    });
  } catch (error) {
    return Response.json(
      {
        message: "Error fetching data",
        data: null,
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const ownerData: Prisma.ownerCreateInput = await request.json();
    const owner = await prisma.owner.create({
      data: ownerData,
    });
    return Response.json({
      message: "Owner created successfully",
      data: owner,
    });
  } catch (error) {
    return Response.json(
      {
        message: "Error creating owner",
        data: error,
      },
      {
        status: 500,
      },
    );
  }
}
