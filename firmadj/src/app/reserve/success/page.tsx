import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ReserveSuccessPage() {
  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 py-12">
        <div className="max-w-xl mx-auto px-4">
          <Card className="border-slate-200 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Tak. Vi har modtaget jeres reservationsanmodning.</h1>
              <p className="text-slate-600 mb-6">Vi gennemgår tilgængelighed og tekniske detaljer og vender tilbage snarest.</p>
              <div className="space-y-2 text-sm text-slate-500 mb-8">
                <p>1. Vi gennemgår tilgængelighed og tekniske detaljer</p>
                <p>2. I modtager endelig bekræftelse eller eventuelle spørgsmål</p>
                <p>3. Kontrakt og faktura/depositum sendes</p>
                <p>4. Det endelige event spørgeskema udfyldes</p>
                <p>5. Køreplan og teknik bekræftes før arrangementet</p>
              </div>
              <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
                <Link href="/">Tilbage til forsiden</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
