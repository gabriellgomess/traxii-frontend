import type { Brand } from '../types';

interface BrandLogoProps {
  brand: Pick<Brand, 'name' | 'primaryColor' | 'logoUrl'>;
  size?: number;
  /** true = fundo branco com inicial na cor primária (para uso sobre a sidebar) */
  inverted?: boolean;
}

/** Logo da marca; sem imagem, usa a inicial do nome sobre a cor primária. */
export function BrandLogo({ brand, size = 40, inverted = false }: BrandLogoProps) {
  const initial = (brand.name || '?').charAt(0).toUpperCase();

  if (brand.logoUrl) {
    return (
      <div
        role="img"
        aria-label="logo"
        className="rounded-xl bg-white bg-cover bg-center"
        style={{ width: size, height: size, backgroundImage: `url(${brand.logoUrl})` }}
      />
    );
  }

  return (
    <div
      className="grid place-items-center rounded-xl font-display font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.475,
        background: inverted ? '#fff' : brand.primaryColor,
        color: inverted ? brand.primaryColor : '#fff',
      }}
    >
      {initial}
    </div>
  );
}
