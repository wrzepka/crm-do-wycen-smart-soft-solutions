import { FileText, Users, Briefcase, FileCheck, XCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function QuickActions() {
  return (
    <Card className="bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground border-none shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-1">Szybkie akcje</h3>
        <p className="text-primary-foreground/80 text-sm mb-6">Co chcesz teraz zrobić?</p>

        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            className="w-full h-11 justify-start gap-3 font-semibold shadow-sm text-primary"
          >
            <FileText size={18} /> Utwórz nową wycenę
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white border-0"
            >
              <Users size={20} /> <span className="text-xs">Dodaj Klienta</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white border-0"
            >
              <Briefcase size={20} /> <span className="text-xs">Nowy Projekt</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivitiesList() {
  const activities = [
    {
      id: 1,
      text: 'Nowa wycena dla TechSoft',
      time: '2 min temu',
      icon: FileCheck,
      color: 'text-blue-500',
    },
    {
      id: 2,
      text: 'Dodano klienta: ModaPolska',
      time: '1 godz. temu',
      icon: Users,
      color: 'text-emerald-500',
    },
    {
      id: 3,
      text: 'Odrzucona oferta (ID #124)',
      time: '3 godz. temu',
      icon: XCircle,
      color: 'text-red-500',
    },
    {
      id: 4,
      text: "Projekt 'Migracja' zakończony",
      time: 'Wczoraj',
      icon: CheckCircle2,
      color: 'text-indigo-500',
    },
  ];

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-lg">Ostatnia aktywność</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4">
              {/* Dynamic text color for icon */}
              <div className={cn('mt-0.5', activity.color)}>
                <activity.icon size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-foreground">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="link" className="w-full mt-6 text-muted-foreground hover:text-primary">
          Zobacz całą historię
        </Button>
      </CardContent>
    </Card>
  );
}
