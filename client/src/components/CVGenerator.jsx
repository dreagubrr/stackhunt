import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CVGenerator = ({ user, profile, avatarBase64, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [generating, setGenerating] = useState(false);
  const cvRef = useRef();

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll('img');
          return Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          }));
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let yOffset = 0;
        let remainingHeight = pdfHeight;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, pdfHeight);
          remainingHeight -= pageHeight;
          yOffset += pageHeight;
          if (remainingHeight > 0) pdf.addPage();
        }
      }
      pdf.save(`CV_${user.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  const name = user.name || '';
  const title = profile.title || '';
  const email = user.email || '';
  const phone = profile.phone || '';
  const location = profile.location || '';
  const bio = profile.bio || '';
  const skills = profile.skills || [];
  const languages = profile.languages || [];
  const education = profile.education || [];
  const workExperience = profile.workExperience || [];
  const linkedin = profile.links?.linkedin || '';
  const portfolio = profile.links?.portfolio || '';
  const github = profile.links?.github || '';

  const divider = <div style={{ borderBottom: '1px solid #e5e7eb', margin: '14px 0' }} />;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '20px', overflowY: 'auto', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>

        {/* Toolbar */}
        <div style={{ background: '#0a0a0a', borderRadius: '16px 16px 0 0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'modern', label: 'Moderna' },
              { id: 'classic', label: 'Clásica' },
            ].map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                style={{
                  padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: selectedTemplate === t.id ? '#6366f1' : '#1f1f1f',
                  color: selectedTemplate === t.id ? '#fff' : '#9ca3af',
                }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleDownload} disabled={generating}
              style={{ background: '#6366f1', color: '#fff', borderRadius: '8px', padding: '8px 20px', fontWeight: 600, cursor: 'pointer', border: 'none', fontSize: '0.875rem', opacity: generating ? 0.7 : 1 }}>
              {generating ? 'Generando...' : '⬇️ Descargar PDF'}
            </button>
            <button onClick={onClose}
              style={{ background: '#1f1f1f', color: '#9ca3af', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', border: 'none', fontSize: '0.875rem' }}>
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* CV Preview */}
        <div style={{ background: '#f3f4f6', padding: '24px', borderRadius: '0 0 16px 16px' }}>
          <div ref={cvRef}>

            {/* ===== PLANTILLA MODERNA ===== */}
            {selectedTemplate === 'modern' && (
              <div style={{ background: '#fff', width: '210mm', minHeight: '297mm', margin: '0 auto', fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#1a1a1a', display: 'flex' }}>

                {/* Columna lateral izquierda */}
                <div style={{ width: '38%', background: '#1a1a2e', color: '#fff', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Foto */}
                  {avatarBase64 && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <img src={avatarBase64} alt={name}
                        style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1' }} />
                    </div>
                  )}

                  {/* Contacto */}
                  <div>
                    <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#a5b4fc', marginBottom: '10px', borderBottom: '1px solid #374151', paddingBottom: '6px' }}>Contacto</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9px', color: '#d1d5db' }}>
                      {email && <p style={{ margin: 0 }}>✉ {email}</p>}
                      {phone && <p style={{ margin: 0 }}>📞 {phone}</p>}
                      {location && <p style={{ margin: 0 }}>📍 {location}</p>}
                      {linkedin && <p style={{ margin: 0 }}>in {linkedin.replace('https://linkedin.com/in/', '')}</p>}
                      {portfolio && <p style={{ margin: 0 }}>🌐 {portfolio.replace('https://', '')}</p>}
                      {github && <p style={{ margin: 0 }}>⌥ {github.replace('https://github.com/', '')}</p>}
                    </div>
                  </div>

                  {/* Habilidades */}
                  {skills.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#a5b4fc', marginBottom: '10px', borderBottom: '1px solid #374151', paddingBottom: '6px' }}>Habilidades</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {skills.map(skill => (
                          <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                            <span style={{ fontSize: '9px', color: '#e5e7eb' }}>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Idiomas */}
                  {languages.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#a5b4fc', marginBottom: '10px', borderBottom: '1px solid #374151', paddingBottom: '6px' }}>Idiomas</h2>
                      {languages.map((l, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '9px', color: '#e5e7eb', fontWeight: 600 }}>{l.language}</span>
                          <span style={{ fontSize: '9px', color: '#a5b4fc' }}>{l.level}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formación */}
                  {education.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#a5b4fc', marginBottom: '10px', borderBottom: '1px solid #374151', paddingBottom: '6px' }}>Formación</h2>
                      {education.map((e, i) => (
                        <div key={i} style={{ marginBottom: '10px' }}>
                          <p style={{ fontWeight: 700, margin: 0, fontSize: '9.5px', color: '#fff' }}>{e.degree}</p>
                          <p style={{ color: '#a5b4fc', margin: '2px 0 0', fontSize: '9px' }}>{e.institution}</p>
                          {e.year && <p style={{ color: '#6b7280', margin: '2px 0 0', fontSize: '8.5px' }}>{e.year}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Columna principal derecha */}
                <div style={{ flex: 1, padding: '32px 28px' }}>

                  {/* Nombre y título */}
                  <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1 }}>{name}</h1>
                    {title && <p style={{ color: '#6366f1', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>{title}</p>}
                  </div>

                  {bio && (
                    <div style={{ marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#6366f1', marginBottom: '8px' }}>Sobre mí</h2>
                      <div style={{ borderBottom: '2px solid #6366f1', marginBottom: '10px' }} />
                      <p style={{ color: '#4b5563', lineHeight: 1.7, margin: 0, fontSize: '9.5px' }}>{bio}</p>
                    </div>
                  )}

                  {workExperience.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#6366f1', marginBottom: '8px' }}>Experiencia laboral</h2>
                      <div style={{ borderBottom: '2px solid #6366f1', marginBottom: '14px' }} />
                      {workExperience.map((w, i) => (
                        <div key={i} style={{ marginBottom: '16px' }}>
                          <p style={{ fontWeight: 700, margin: 0, fontSize: '11px' }}>{w.position}</p>
                          <p style={{ color: '#6366f1', margin: '2px 0', fontWeight: 600, fontSize: '10px' }}>{w.company}</p>
                          <p style={{ color: '#9ca3af', margin: '2px 0 6px', fontSize: '8.5px' }}>{w.startDate} — {w.endDate || 'Actualidad'}</p>
                          {w.description && <p style={{ color: '#4b5563', margin: 0, lineHeight: 1.6, fontSize: '9.5px' }}>{w.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== PLANTILLA CLÁSICA ===== */}
            {selectedTemplate === 'classic' && (
              <div style={{ background: '#fff', width: '210mm', minHeight: '297mm', margin: '0 auto', fontFamily: 'Georgia, serif', fontSize: '11px', color: '#1a1a1a' }}>

                {/* Header */}
                <div style={{ padding: '32px 36px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1a1a1a' }}>
                  <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '30px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px', lineHeight: 1.1 }}>{name}</h1>
                    {title && <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px', fontStyle: 'italic' }}>{title}</p>}
                    {bio && <p style={{ color: '#4b5563', fontSize: '10px', marginTop: '10px', lineHeight: 1.6, maxWidth: '80%' }}>{bio}</p>}
                  </div>
                  {avatarBase64 && (
                    <img src={avatarBase64} alt={name}
                      style={{ width: '90px', height: '90px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb', flexShrink: 0 }} />
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0' }}>

                  {/* Columna principal */}
                  <div style={{ padding: '24px 28px 24px 36px', borderRight: '1px solid #e5e7eb' }}>

                    {workExperience.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Experiencia laboral</h2>
                        <div style={{ borderBottom: '2px solid #1a1a1a', marginBottom: '12px' }} />
                        {workExperience.map((w, i) => (
                          <div key={i} style={{ marginBottom: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <p style={{ fontWeight: 700, margin: 0, fontSize: '11px' }}>{w.position}</p>
                              <p style={{ color: '#9ca3af', margin: 0, fontSize: '8.5px', whiteSpace: 'nowrap' }}>{w.startDate} — {w.endDate || 'Actualidad'}</p>
                            </div>
                            <p style={{ color: '#6b7280', margin: '2px 0 4px', fontStyle: 'italic', fontSize: '10px' }}>{w.company}</p>
                            {w.description && <p style={{ color: '#4b5563', margin: 0, lineHeight: 1.6, fontSize: '9.5px' }}>{w.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {education.length > 0 && (
                      <div>
                        <h2 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Formación académica</h2>
                        <div style={{ borderBottom: '2px solid #1a1a1a', marginBottom: '12px' }} />
                        {education.map((e, i) => (
                          <div key={i} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <p style={{ fontWeight: 700, margin: 0, fontSize: '10.5px' }}>{e.degree}</p>
                              <p style={{ color: '#6b7280', margin: '2px 0 0', fontStyle: 'italic', fontSize: '9.5px' }}>{e.institution}</p>
                            </div>
                            {e.year && <p style={{ color: '#9ca3af', margin: 0, fontSize: '8.5px', whiteSpace: 'nowrap' }}>{e.year}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Columna lateral */}
                  <div style={{ padding: '24px 36px 24px 24px' }}>

                    {/* Contacto */}
                    <div style={{ marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Contacto</h2>
                      <div style={{ borderBottom: '2px solid #1a1a1a', marginBottom: '10px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '9px', color: '#4b5563' }}>
                        {email && <p style={{ margin: 0 }}>✉ {email}</p>}
                        {phone && <p style={{ margin: 0 }}>📞 {phone}</p>}
                        {location && <p style={{ margin: 0 }}>📍 {location}</p>}
                        {linkedin && <p style={{ margin: 0 }}>in {linkedin.replace('https://linkedin.com/in/', '')}</p>}
                        {portfolio && <p style={{ margin: 0 }}>🌐 {portfolio.replace('https://', '')}</p>}
                        {github && <p style={{ margin: 0 }}>⌥ {github.replace('https://github.com/', '')}</p>}
                      </div>
                    </div>

                    {skills.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Habilidades</h2>
                        <div style={{ borderBottom: '2px solid #1a1a1a', marginBottom: '10px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {skills.map(skill => (
                            <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1a1a1a', flexShrink: 0 }} />
                              <span style={{ fontSize: '9px' }}>{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {languages.length > 0 && (
                      <div>
                        <h2 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Idiomas</h2>
                        <div style={{ borderBottom: '2px solid #1a1a1a', marginBottom: '10px' }} />
                        {languages.map((l, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 600 }}>{l.language}</span>
                            <span style={{ fontSize: '9px', color: '#6b7280' }}>{l.level}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CVGenerator;