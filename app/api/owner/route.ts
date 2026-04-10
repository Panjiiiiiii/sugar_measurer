import { prisma } from "@/lib/prisma";

type CreateOwnerPayload = {
  name: string;
  account_number: string;
  ownership_type: "farmer" | "private";
};

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
    const ownerData: CreateOwnerPayload = await request.json();
    const owner = await prisma.owner.create({
      data: {
        name: ownerData.name,
        account_number: ownerData.account_number,
        ownership_type: ownerData.ownership_type,
      },
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
