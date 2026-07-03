import { CartProvider } from "@/components/cart/cart-provider";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
