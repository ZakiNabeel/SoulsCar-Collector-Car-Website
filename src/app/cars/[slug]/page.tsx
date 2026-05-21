import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cars } from "@/lib/cars-data";
import { CarDetailClient } from "./_client";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = cars.find((c) => c.slug === slug);
  if (!car) return {};
  return {
    title: `${car.year} ${car.name} — SoulCars.pk`,
    description: car.description,
    openGraph: { images: [car.image] },
  };
}

export default async function CarDetailPage({ params }: Props) {
  const { slug } = await params;
  const car = cars.find((c) => c.slug === slug);
  if (!car) notFound();
  return <CarDetailClient car={car} />;
}
