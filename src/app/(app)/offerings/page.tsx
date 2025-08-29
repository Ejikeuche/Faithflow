import { OfferingValidator } from "@/components/offering-validator";

export default function OfferingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Offerings</h1>
        <p className="text-muted-foreground">
          Upload and validate offering records.
        </p>
      </div>
      <div className="max-w-4xl">
        <OfferingValidator />
      </div>
    </div>
  );
}
