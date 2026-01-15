import { NextRequest, NextResponse } from 'next/server';

// TODO: Install stripe package and uncomment below
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//   apiVersion: '2024-06-20',
// });

export async function POST(request: NextRequest) {
  try {
    const { items, customerInfo } = await request.json();

    // TODO: Implement Stripe checkout after installing stripe package
    // For now, return a mock response
    return NextResponse.json({ 
      message: 'Stripe integration pending - install stripe package',
      items: items,
      customerInfo: customerInfo 
    });

    // Create line items for Stripe
    // const lineItems = items.map((item: any) => ({
    //   price_data: {
    //     currency: 'vnd',
    //     product_data: {
    //       name: item.name,
    //       description: `${item.size ? `Size: ${item.size}` : ''}${item.size && item.color ? ' | ' : ''}${item.color ? `Color: ${item.color}` : ''}`,
    //       images: [item.image],
    //     },
    //     unit_amount: item.price * 100, // Convert to cents
    //   },
    //   quantity: item.quantity,
    // }));

    // Create checkout session
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: lineItems,
    //   mode: 'payment',
    //   success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
    //   metadata: {
    //     customerInfo: JSON.stringify(customerInfo),
    //     items: JSON.stringify(items),
    //   },
    // });

    // return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
