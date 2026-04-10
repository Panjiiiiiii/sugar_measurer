import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function GET() {
  try {
    const owners = await prisma.owner.findMany();
    return Response.json(
      {
        statusCode: 200,
        data: owners,
      },
      { status: 200 },
    );
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
    return Response.json(
      {
        statusCode: 201,
        message: "Owner created successfully",
      },
      { status: 201 },
    );
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
