// ============================================================
//  Lógica y plantilla compartidas entre bitacora.html (formulario)
//  y vista-previa.html (solo lectura). Un solo lugar para el diseño
//  del formato oficial, así ambos se ven siempre igual.
// ============================================================

        var DIAS_POR_BITACORA = 15;
        var MAX_BITACORAS = 12;
        var MIN_ACTIVIDADES = 3;

        function formatFechaInput(d) {
            var y = d.getUTCFullYear();
            var m = String(d.getUTCMonth() + 1).padStart(2, '0');
            var day = String(d.getUTCDate()).padStart(2, '0');
            return y + '-' + m + '-' + day;
        }

        function formatFechaVisible(d) {
            return formatFechaInput(d).split('-').reverse().join('/');
        }

        function parseFechaInput(str) {
            var partes = str.split('-');
            return new Date(Date.UTC(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10)));
        }

        // Convierte una fecha en formato "yyyy-mm-dd" (como vienen los <input type="date">) a "dd/mm/yyyy"
        function formatearFechaDDMMYYYY(str) {
            if (!str) return '';
            var partes = str.split('-');
            if (partes.length !== 3) return str;
            return partes[2] + '/' + partes[1] + '/' + partes[0];
        }

        function periodoParaNumero(fechaInicioStr, numero) {
            if (!fechaInicioStr || !numero) return null;
            var inicioEtapa = parseFechaInput(fechaInicioStr);
            var desde = new Date(inicioEtapa);
            desde.setUTCDate(desde.getUTCDate() + (numero - 1) * DIAS_POR_BITACORA);
            var hasta = new Date(desde);
            hasta.setUTCDate(hasta.getUTCDate() + DIAS_POR_BITACORA - 1);
            return { desde: formatFechaInput(desde), hasta: formatFechaInput(hasta) };
        }

        var FORM_STATE_KEY = 'bitacoraFormState';
        var ESTADO = { campos: {}, alternativa: '', competencias: [], porBitacora: {}, fechasEntrega: {}, firmas: {} };

        function cargarEstadoDesdeStorage() {
            var raw;
            try { raw = sessionStorage.getItem(FORM_STATE_KEY); } catch (e) { return; }
            if (!raw) return;
            try {
                var guardado = JSON.parse(raw);
                ESTADO.campos = guardado.campos || {};
                ESTADO.alternativa = guardado.alternativa || '';
                ESTADO.competencias = guardado.competencias || [];
                ESTADO.porBitacora = guardado.porBitacora || {};
                ESTADO.fechasEntrega = guardado.fechasEntrega || {};
                ESTADO.firmas = guardado.firmas || {};
            } catch (e) { /* estado corrupto, se ignora */ }
        }

        function escapeHtml(texto) {
            var div = document.createElement('div');
            div.textContent = texto == null ? '' : texto;
            return div.innerHTML;
        }

        var TEXTO_DECRETO = 'Decreto 055 de 2015, por el cual se reglamenta la afiliación de estudiantes al Sistema General de Riesgos Laborales y se dictan otras disposiciones';
        var TEXTO_ESPACIO_OBLIGATORIO = 'Este espacio debe ser siempre diligenciado.';
        var TEXTO_ARTICULO_11 = 'Artículo 11. Obligaciones de la institución de educación. Corresponde a las instituciones de educación a las que pertenezcan los estudiantes, que deban ser afiliados al Sistema General de Riesgos Laborales de conformidad con el presente decreto:';
        var TEXTO_OBLIGACION_1 = '1. Revisar periódicamente que el estudiante en práctica desarrolle labores relacionadas exclusivamente con su programa de formación o educación, que ameritaron su afiliación al Sistema General de Riesgos Laborales.';
        var TEXTO_OBLIGACION_2 = '2. Verificar que el espacio de práctica cuente con los elementos de protección personal apropiados según el riesgo ocupacional.';

        // ------------------------------------------------------------------
        // Cuadrícula de 8 columnas (equivalentes a las columnas B..I del Excel
        // oficial), con los anchos REALES extraídos de esa hoja. Se usa la MISMA
        // cuadrícula en TODAS las tablas del documento, así los bordes de
        // cualquier fila coinciden verticalmente con los de cualquier otra fila,
        // en toda la página — igual que en el archivo original.
        // ------------------------------------------------------------------
        var ANCHOS_COLUMNAS_8 = [13.73, 8.78, 10.87, 10.08, 11.37, 11.37, 16.46, 17.34]; // B,C,D,E,F,G,H,I
        var COLGROUP_8 = '<colgroup>' + ANCHOS_COLUMNAS_8.map(function (w) { return '<col style="width:' + w + '%">'; }).join('') + '</colgroup>';
        function tablaGrid(contenidoFilas, margenInferior) {
            return '<table style="width:100%;border-collapse:collapse;table-layout:fixed;' + (margenInferior !== false ? 'margin-bottom:6px;' : '') + '">' +
                COLGROUP_8 + contenidoFilas + '</table>';
        }

        var ESTILO_ANTI_DESBORDE = 'word-break:break-word;overflow-wrap:anywhere;';
        function barraNegra(texto) {
            return '<div style="background:#000;color:#fff;font-weight:bold;text-align:center;padding:3px 4px;border:1px solid #000;font-size:9px;' + ESTILO_ANTI_DESBORDE + '">' + escapeHtml(texto) + '</div>';
        }
        function barraGris(texto) {
            return '<div style="background:#595959;color:#fff;font-weight:bold;text-align:center;padding:3px 4px;border:1px solid #000;font-size:8.5px;' + ESTILO_ANTI_DESBORDE + '">' + escapeHtml(texto) + '</div>';
        }
        function barraBlanca(texto) {
            return '<div style="background:#fff;color:#000;font-weight:bold;text-align:center;padding:3px 4px;border:1px solid #000;font-size:9px;' + ESTILO_ANTI_DESBORDE + '">' + escapeHtml(texto) + '</div>';
        }
        function celdaEtiqueta(texto, colspan, rowspan) {
            return '<td colspan="' + (colspan || 1) + '"' + (rowspan ? ' rowspan="' + rowspan + '"' : '') + ' style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px 3px;' + ESTILO_ANTI_DESBORDE + '">' + escapeHtml(texto) + '</td>';
        }
        function celdaEtiquetaOscura(texto, colspan) {
            return '<td colspan="' + (colspan || 1) + '" style="border:1px solid #000;background:#000;color:#fff;font-weight:bold;text-align:center;font-size:7px;padding:2px 3px;' + ESTILO_ANTI_DESBORDE + '">' + escapeHtml(texto) + '</td>';
        }
        function celdaEncabezadoActividad(html, colspan) {
            return '<td colspan="' + (colspan || 1) + '" style="border:1px solid #000;background:#595959;color:#fff;font-weight:bold;text-align:center;font-size:7px;padding:3px 4px;line-height:1.35;' + ESTILO_ANTI_DESBORDE + '">' + html + '</td>';
        }
        function celdaValor(texto, alinear, colspan, rowspan) {
            return '<td colspan="' + (colspan || 1) + '"' + (rowspan ? ' rowspan="' + rowspan + '"' : '') + ' style="border:1px solid #000;text-align:' + (alinear || 'left') + ';font-size:8px;padding:3px 4px;' + ESTILO_ANTI_DESBORDE + '">' + escapeHtml(texto || '') + '</td>';
        }
        function celdaLibre(contenidoHtml, colspan, rowspan, extraEstilo) {
            return '<td colspan="' + (colspan || 1) + '"' + (rowspan ? ' rowspan="' + rowspan + '"' : '') + ' style="border:1px solid #000;text-align:center;padding:3px;' + ESTILO_ANTI_DESBORDE + (extraEstilo || '') + '">' + contenidoHtml + '</td>';
        }
        function casilla(marcada) {
            return '<div style="width:9px;height:9px;border:1px solid #000;margin:0 auto;background:' + (marcada ? '#000' : '#fff') + ';"></div>';
        }

        function construirHtmlBitacora(datos, bit, logoDataUrl) {
            var c = datos.campos;

            var filasActividades = '';
            var totalFilas = Math.max(5, bit.actividades.length);
            for (var i = 0; i < totalFilas; i++) {
                var act = bit.actividades[i] || {};
                var contenidoEvidencia = '';
                if (act.evidencia_texto) {
                    contenidoEvidencia += '<div>' + escapeHtml(act.evidencia_texto) + '</div>';
                }
                if (act.evidencia_imagen) {
                    contenidoEvidencia += '<img src="' + act.evidencia_imagen + '" style="max-width:100%;max-height:90px;margin-top:' + (act.evidencia_texto ? '3px' : '0') + ';">';
                }
                filasActividades += '<tr>' +
                    celdaValor(act.descripcion, 'center', 2) +
                    celdaValor(act.competencias, 'center', 2) +
                    celdaValor(act.fecha_inicio, 'center', 1) +
                    celdaValor(act.fecha_fin, 'center', 1) +
                    celdaLibre(contenidoEvidencia, 1) +
                    celdaValor(act.observaciones, 'center', 1) +
                    '</tr>';
            }

            var mapaAlt = {
                'Contrato de aprendizaje': 'altContrato',
                'Monitoria': 'altMonitoria',
                'Proyecto productivo': 'altProyecto',
                'Contrato de vínculo formativo': 'altVinculo',
                'Vínculo laboral': 'altLaboral'
            };
            var altMarcada = mapaAlt[datos.alternativa] || '';
            function xSi(id) { return altMarcada === id ? 'X' : ''; }

            function bloqueFirma(dataUrl) {
                return dataUrl ? '<img src="' + dataUrl + '" style="max-height:50px;max-width:130px;">' : '&nbsp;';
            }

            return '' +
                '<div style="width:780px;padding:14px;font-family:Calibri,\'Segoe UI\',Arial,sans-serif;color:#000;font-size:8px;">' +

                // Encabezado: logo (columnas B-H) + Código/Versión (columna I).
                // El logo se centra respecto al ANCHO TOTAL de la página (no solo su celda),
                // para que quede alineado con el centro de la barra "PROCESO" de abajo.
                '<div style="position:relative;">' +
                tablaGrid(
                    '<tr>' +
                    celdaLibre('', 7, 1, 'height:52px;') +
                    '<td style="border:1px solid #000;padding:0;">' +
                    '<div style="border-bottom:1px solid #000;padding:3px;font-size:8px;">Código: GFPI-F-147</div>' +
                    '<div style="padding:3px;font-size:8px;">Versión: 05</div>' +
                    '</td>' +
                    '</tr>'
                ) +
                (logoDataUrl ? '<img src="' + logoDataUrl + '" style="position:absolute;top:6px;left:50%;transform:translateX(-50%);height:40px;">' : '') +
                '</div>' +

                barraNegra('PROCESO') +
                barraBlanca('GESTIÓN DE FORMACIÓN PROFESIONAL INTEGRAL') +
                barraNegra('NOMBRE DEL FORMATO') +
                barraBlanca('FORMATO BITÁCORA DE SEGUIMIENTO ETAPA PRODUCTIVA') +
                barraNegra('CLASIFICACIÓN DE LA INFORMACIÓN') +

                // Pública (B) / casilla (C-D) / Pública Clasificada (E-F) / casilla (G) / Pública Reservada (H) / casilla (I)
                tablaGrid(
                    '<tr>' +
                    celdaValor('Pública', 'left', 1) +
                    celdaLibre(casilla(true), 2) +
                    celdaValor('Pública Clasificada', 'left', 2) +
                    celdaLibre(casilla(false), 1) +
                    celdaValor('Pública Reservada', 'left', 1) +
                    celdaLibre(casilla(false), 1) +
                    '</tr>'
                ) +

                // Bitácora N° (B-D) / Período a reportar (E-I)
                tablaGrid(
                    '<tr>' + celdaEtiqueta('Bitácora N°', 3) + celdaEtiqueta('PERÍODO A REPORTAR', 5) + '</tr>' +
                    '<tr>' + celdaValor(bit.numero, 'center', 3) +
                    celdaLibre('Desde <strong>' + escapeHtml(formatearFechaDDMMYYYY(bit.periodoDesde)) + '</strong> hasta <strong>' + escapeHtml(formatearFechaDDMMYYYY(bit.periodoHasta)) + '</strong>', 5, 1, 'font-size:8px;') +
                    '</tr>'
                ) +

                barraGris('Datos del aprendiz') +
                tablaGrid(
                    // Nombre (B-D) / Tipo doc (E) / N° identificación (F-G) / Teléfono (H-I)
                    '<tr>' + celdaEtiqueta('NOMBRE DEL APRENDIZ', 3) + celdaEtiqueta('TIPO DE DOCUMENTO', 1) + celdaEtiqueta('NUMERO DE IDENTIFICACION', 2) + celdaEtiqueta('TELEFONO', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.aprendiz_nombre, 'center', 3) + celdaValor(c.aprendiz_tipo_doc, 'center', 1) + celdaValor(c.aprendiz_num_doc, 'center', 2) + celdaValor(c.aprendiz_telefono, 'center', 2) + '</tr>' +
                    // Correo institucional (B-D) / Correo personal (E-G) / Dirección (H-I)
                    '<tr>' + celdaEtiqueta('Correo electrónico institucional', 3) + celdaEtiqueta('Correo electrónico personal', 3) + celdaEtiqueta('Direccion Residencial', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.aprendiz_correo_institucional, 'center', 3) + celdaValor(c.aprendiz_correo_personal, 'center', 3) + celdaValor(c.aprendiz_direccion, 'center', 2) + '</tr>' +
                    // Número de grupo (B-D) / Modalidad (E-G) / Programa (H-I)
                    '<tr>' + celdaEtiqueta('Numero de Grupo', 3) + celdaEtiqueta('Modalidad', 3) + celdaEtiqueta('Programa de Formacion', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.aprendiz_ficha, 'center', 3) + celdaValor(c.aprendiz_modalidad_formacion, 'center', 3) + celdaValor(c.aprendiz_programa, 'center', 2) + '</tr>' +
                    // Modalidad de ejecución (B-D) / Exterior (E-G) / País (H-I)
                    '<tr>' +
                    celdaEtiqueta('Modalidad de ejecución de la etapa productiva (presencial o virtual)', 3) +
                    celdaEtiqueta('¿Realiza la etapa productiva con una entidad u organización en el exterior? (si o no)', 3) +
                    celdaEtiqueta('País donde realiza la etapa productiva', 2) +
                    '</tr>' +
                    '<tr>' + celdaValor(c.modalidad_ejecucion, 'center', 3) + celdaValor(c.etapa_exterior, 'center', 3) + celdaValor(c.etapa_pais, 'center', 2) + '</tr>'
                ) +

                barraGris('Datos del ente co-formador') +
                tablaGrid(
                    // Empresa (B-E) / NIT (F-G) / Dirección (H-I)
                    '<tr>' + celdaEtiqueta('Nombre de la entidad, empresa, institución u organización', 4) + celdaEtiqueta('NIT', 2) + celdaEtiqueta('Dirección', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.empresa_nombre, 'center', 4) + celdaValor(c.empresa_nit, 'center', 2) + celdaValor(c.empresa_direccion, 'center', 2) + '</tr>'
                ) +

                barraGris('Datos de la persona encargada del proceso formativo del aprendiz en la entidad co-formadora') +
                tablaGrid(
                    // Nombre (B-D) / Cargo (E-F) / Teléfono (G) / Correo (H-I)
                    '<tr>' + celdaEtiqueta('Nombre completo del ente co-formador (Jefe inmediato/Supervisor)', 3) + celdaEtiqueta('Cargo del ente co-formador', 2) + celdaEtiqueta('Contacto telefónico', 1) + celdaEtiqueta('Correo electrónico', 2) + '</tr>' +
                    '<tr>' + celdaValor(c.coformador_nombre, 'center', 3) + celdaValor(c.coformador_cargo, 'center', 2) + celdaValor(c.coformador_telefono, 'center', 1) + celdaValor(c.coformador_correo, 'center', 2) + '</tr>'
                ) +

                barraGris('Datos del instructor de seguimiento') +
                tablaGrid(
                    // Nombre (B-F) / Correo (G-I)
                    '<tr>' + celdaEtiqueta('Nombre completo del instructor de seguimiento', 5) + celdaEtiqueta('Correo electrónico del instructor de seguimiento', 3) + '</tr>' +
                    '<tr>' + celdaValor(c.instructor_nombre, 'center', 5) + celdaValor(c.instructor_correo, 'center', 3) + '</tr>'
                ) +

                '<div style="border:1px solid #000;padding:3px;font-size:7.5px;margin-bottom:4px;">Seleccione con una "X" el tipo de alternativa de etapa productiva que está realizando, teniendo en cuenta el subtipo al cual pertenece si es el caso:</div>' +

                // Alternativa (B) / Marque X (C-F) / Alternativa (G) / Marquen X (H-I)
                tablaGrid(
                    '<tr>' + celdaEtiqueta('Alternativa de etapa productiva', 1) + celdaEtiqueta('Marque con una X', 4) + celdaEtiqueta('Alternativa de etapa productiva', 1) + celdaEtiqueta('Marquen con una X', 2) + '</tr>' +
                    '<tr>' +
                    celdaValor('Contrato de aprendizaje', 'left', 1) + celdaLibre('<strong>' + xSi('altContrato') + '</strong>', 4) +
                    celdaValor('Monitoria', 'left', 1) + celdaLibre('<strong>' + xSi('altMonitoria') + '</strong>', 2) +
                    '</tr>' +
                    '<tr>' +
                    celdaValor('Vínculo Formativo', 'left', 1, 2) + celdaLibre('<strong>' + xSi('altVinculo') + '</strong>', 4, 2) +
                    celdaValor('Proyecto productivo', 'left', 1) + celdaLibre('<strong>' + xSi('altProyecto') + '</strong>', 2) +
                    '</tr>' +
                    '<tr>' +
                    celdaValor('Vínculo laboral', 'left', 1) + celdaLibre('<strong>' + xSi('altLaboral') + '</strong>', 2) +
                    '</tr>'
                ) +

                barraGris('Descripción de las actividades realizadas') +

                // Descripción (B-C) / Competencias (D-E) / F.inicio (F) / F.fin (G) / Evidencia (H) / Observaciones (I)
                tablaGrid(
                    '<tr>' +
                    celdaEncabezadoActividad('<div>Descripción de la actividad</div><div style="font-weight:normal;font-style:italic;font-size:6.5px;">(Ingrese cuantas filas sean necesarias)</div>', 2) +
                    celdaEncabezadoActividad('Competencias del programa de formación aplicadas en el desarrollo de la actividad', 2) +
                    celdaEncabezadoActividad('<div>Fecha de inicio</div><div style="font-weight:normal;font-size:6.5px;">(dd/mm/aa)</div>', 1) +
                    celdaEncabezadoActividad('<div>Fecha de fin</div><div style="font-weight:normal;font-size:6.5px;">(dd/mm/aa)</div>', 1) +
                    celdaEncabezadoActividad('<div>Evidencia de cumplimiento</div><div style="font-weight:normal;font-style:italic;font-size:6.5px;">(Indique si corresponde a un documento, proceso, producto, entregable u otro)</div><div style="font-weight:normal;font-size:6.5px;">En anexo puede fortalecer la evidencia si es el caso.</div>', 1) +
                    celdaEncabezadoActividad('Observaciones, inasistencias, dificultades presentadas, y/o comentarios realizados por el aprendiz y/o jefe inmediato', 1) +
                    '</tr>' +
                    filasActividades
                ) +

                '<div style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px;">' + escapeHtml(TEXTO_DECRETO) + '</div>' +
                '<div style="border:1px solid #000;font-size:7.5px;padding:2px;">' + escapeHtml(TEXTO_ESPACIO_OBLIGATORIO) + '</div>' +
                '<div style="border:1px solid #000;font-size:7px;padding:3px;margin-bottom:4px;">' +
                escapeHtml(TEXTO_ARTICULO_11) + '<br>' + escapeHtml(TEXTO_OBLIGACION_1) + '<br>' + escapeHtml(TEXTO_OBLIGACION_2) +
                '</div>' +

                // ARL — igual a la estructura real del Excel:
                // B=¿afiliado? | C:D=nivel riesgo | E:F(2 filas)=¿corresponde? | G=valor corresponde
                // H(2 filas)=¿EPP? | I=valor EPP
                tablaGrid(
                    '<tr>' +
                    celdaEtiqueta('¿El aprendiz se encuentra afiliado a la ARL?', 1) +
                    celdaEtiqueta('Indique el nivel de riesgo actual', 2) +
                    celdaEtiqueta('¿El nivel de riesgo de la ARL corresponde a las actividades que desarrolla el aprendiz en la empresa?', 2, 2) +
                    celdaValor(c.arl_nivel_corresponde, 'center', 1) +
                    celdaEtiqueta('¿El aprendiz cuenta con los elementos de protección personal (EPP), requeridos para desarrollar su etapa productiva?', 1, 2) +
                    celdaValor(c.arl_epp, 'center', 1) +
                    '</tr>' +
                    '<tr>' +
                    celdaValor(c.arl_afiliado, 'center', 1) +
                    celdaValor(c.arl_nivel_riesgo, 'center', 2) +
                    '<td style="border:1px solid #000;"></td>' +
                    '<td style="border:1px solid #000;"></td>' +
                    '</tr>'
                ) +

                '<div style="text-align:center;font-size:7.5px;font-style:italic;padding:4px 2px;"><strong>Aprendiz:</strong> recuerde diligenciar completamente el formato de bitácora y entregarlo o cargarlo al espacio asignado para este</div>' +

                // Firmas: Aprendiz + Fecha (B-E / F-I), Instructor + Co-formador (B-E / F-I)
                tablaGrid(
                    '<tr>' +
                    celdaLibre(bloqueFirma(datos.firmas.firmaAprendiz), 4, 1, 'height:50px;border:0;vertical-align:bottom;') +
                    celdaLibre(escapeHtml(bit.fecha_entrega || ''), 4, 1, 'border:0;vertical-align:bottom;') +
                    '</tr>' +
                    '<tr>' +
                    celdaLibre('Firma de la persona con rol de aprendiz', 4, 1, 'border:0;border-top:1px solid #000;font-size:7.5px;') +
                    celdaLibre('Fecha entrega bitácora', 4, 1, 'border:0;border-top:1px solid #000;font-size:7.5px;') +
                    '</tr>' +
                    '<tr><td colspan="8" style="border:0;height:10px;"></td></tr>' +
                    '<tr>' +
                    celdaLibre(bloqueFirma(datos.firmas.firmaInstructor), 4, 1, 'height:50px;border:0;vertical-align:bottom;') +
                    celdaLibre(bloqueFirma(datos.firmas.firmaCoformador), 4, 1, 'border:0;vertical-align:bottom;') +
                    '</tr>' +
                    '<tr>' +
                    celdaLibre('Firma del instructor de seguimiento', 4, 1, 'border:0;border-top:1px solid #000;font-size:7.5px;') +
                    celdaLibre('Firma del ente co-formador', 4, 1, 'border:0;border-top:1px solid #000;font-size:7.5px;') +
                    '</tr>',
                    false
                ) +

                '<div style="font-size:7px;padding:4px 2px 2px 2px;">' +
                '<strong>Nota:</strong> Con el diligenciamiento de este formato autorizo al SENA para la recolección y tratamiento de mis datos personales, ' +
                'conforme a la política de datos personales de la entidad GOR-POL-006. Entiendo que los datos serán objeto de recolección, almacenamiento, ' +
                'uso, circulación, supresión, transferencia, transmisión, cesión y todo el tratamiento, realizados por el SENA.' +
                '</div>' +

                '<div style="background:#000;color:#fff;font-weight:bold;text-align:center;padding:3px 4px;border:1px solid #000;font-size:8px;margin-top:6px;">Anexo: Es opcional relacionar evidencia fotográfica de las actividades desarrolladas</div>' +
                '<div style="background:#808080;color:#fff;text-align:center;padding:2px 4px;border:1px solid #000;font-size:7.5px;">(No aplica documentos de la empresa u otros aspectos sensibles)</div>' +

                '</div>';
        }

        // Nombre de archivo: Ficha - Cédula - Nombre completo - BIT
        function construirNombreArchivo(datos) {
            var partes = [
                datos.campos.aprendiz_ficha || 'sinficha',
                datos.campos.aprendiz_num_doc || 'sincedula',
                datos.campos.aprendiz_nombre || 'sinnombre',
                'BIT'
            ];
            // Si se descargó solo una bitácora puntual (no las 12), se nota en el nombre del archivo.
            if (datos.bitacoras && datos.bitacoras.length === 1) {
                partes.push(String(datos.bitacoras[0].numero));
            }
            var nombre = partes.join(' - ');
            return nombre.replace(/[\\/:*?"<>|]/g, '-');
        }
