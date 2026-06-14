import { Card } from '../../components/ui/Card';

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-5 p-5 pt-8">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-colibri-primary/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">🐦</span>
        </div>
        <h2 className="text-xl font-semibold text-colibri-text">Seu cantinho</h2>
        <p className="text-sm text-colibri-text-secondary mt-1">
          Ajuste o Colibri do seu jeito
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <SettingRow label="Nome" value="Viajante" />
          <SettingRow label="Timer padrao" value="25 min" />
          <SettingRow label="Notificacoes" value="Ativadas" />
          <SettingRow label="Sons" value="Ativados" />
        </div>
      </Card>

      <Card className="text-center">
        <p className="text-sm text-colibri-text-secondary">
          Mais configuracoes em breve
        </p>
      </Card>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-colibri-text-secondary">{label}</span>
      <span className="text-sm font-medium text-colibri-text">{value}</span>
    </div>
  );
}
