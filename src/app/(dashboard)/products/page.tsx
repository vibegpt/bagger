import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

export default async function ProductsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      products: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const products = user?.products || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="mt-2 text-gray-600">
          Manage and view all your products from connected platforms.
        </p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Products Yet</CardTitle>
            <CardDescription>
              Connect your Whop account to see your products here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>
              {products.length} {products.length === 1 ? 'product' : 'products'} synced from your platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="capitalize">{product.platform}</TableCell>
                    <TableCell>{formatCurrency(Number(product.price), product.currency)}</TableCell>
                    <TableCell className="capitalize">{product.billingPeriod || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
