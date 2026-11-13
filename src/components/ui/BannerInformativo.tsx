import React from 'react';
import '../../styles/bannerInformativo.css';

export interface BannerInformativoProps {
  titulo: string;
  descripcion: string;
  linkTexto?: string;
  linkUrl?: string;
}

export const BannerInformativo: React.FC<BannerInformativoProps> = ({
  titulo,
  descripcion,
  linkTexto,
  linkUrl
}) => {
  return (
    <div className="ui-banner-info">
      <div className="ui-banner-body">
        <strong>{titulo}</strong> &mdash; <span>{descripcion}</span>
      </div>
      {linkTexto && linkUrl && (
        <a href={linkUrl} className="ui-banner-link">
          {linkTexto} &rarr;
        </a>
      )}
    </div>
  );
};
