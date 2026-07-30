// ============================================================
//  Lógica y plantilla compartidas entre buttons.html (formulario)
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
        var ESTADO = { campos: {}, alternativa: '', competencias: [], porBitacora: {}, firmas: {} };

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

        function barraNegra(texto) {
            return '<div style="background:#000;color:#fff;font-weight:bold;text-align:center;padding:3px 4px;border:1px solid #000;font-size:9px;">' + escapeHtml(texto) + '</div>';
        }
        function barraBlanca(texto) {
            return '<div style="background:#fff;color:#000;font-weight:bold;text-align:center;padding:3px 4px;border:1px solid #000;font-size:9px;">' + escapeHtml(texto) + '</div>';
        }
        function celdaEtiqueta(texto) {
            return '<td style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px 3px;">' + escapeHtml(texto) + '</td>';
        }
        function celdaValor(texto, alinear) {
            return '<td style="border:1px solid #000;text-align:' + (alinear || 'left') + ';font-size:8px;padding:3px 4px;">' + escapeHtml(texto || '') + '</td>';
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
                var evidenciaTexto = act.evidencia_texto || (act.evidencia_imagen ? '(ver imagen adjunta)' : '');
                filasActividades += '<tr>' +
                    celdaValor(act.descripcion, 'center') +
                    celdaValor(act.competencias, 'center') +
                    celdaValor(act.fecha_inicio, 'center') +
                    celdaValor(act.fecha_fin, 'center') +
                    celdaValor(evidenciaTexto, 'center') +
                    celdaValor(act.observaciones, 'center') +
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
                return dataUrl ? '<img src="' + dataUrl + '" style="max-height:55px;max-width:140px;">' : '&nbsp;';
            }

            return '' +
                '<div style="width:780px;padding:14px;font-family:Arial,Helvetica,sans-serif;color:#000;font-size:8px;">' +

                '<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">' +
                '<tr>' +
                '<td style="border:1px solid #000;text-align:center;padding:6px;" >' + (logoDataUrl ? '<img src="' + logoDataUrl + '" style="height:40px;">' : '') + '</td>' +
                '<td style="border:1px solid #000;width:160px;padding:0;">' +
                '<div style="border-bottom:1px solid #000;padding:3px;font-size:8px;">Código: GFPI-F-147</div>' +
                '<div style="padding:3px;font-size:8px;">Versión: 05</div>' +
                '</td>' +
                '</tr>' +
                '</table>' +

                barraNegra('PROCESO') +
                barraBlanca('GESTIÓN DE FORMACIÓN PROFESIONAL INTEGRAL') +
                barraNegra('NOMBRE DEL FORMATO') +
                barraBlanca('FORMATO BITÁCORA DE SEGUIMIENTO ETAPA PRODUCTIVA') +
                barraNegra('CLASIFICACIÓN DE LA INFORMACIÓN') +

                '<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">' +
                '<tr>' +
                '<td style="border:1px solid #000;font-size:8px;padding:3px;">Pública</td>' +
                '<td style="border:1px solid #000;width:26px;">' + casilla(true) + '</td>' +
                '<td style="border:1px solid #000;font-size:8px;padding:3px;">Pública Clasificada</td>' +
                '<td style="border:1px solid #000;width:26px;">' + casilla(false) + '</td>' +
                '<td style="border:1px solid #000;font-size:8px;padding:3px;">Pública Reservada</td>' +
                '<td style="border:1px solid #000;width:26px;">' + casilla(false) + '</td>' +
                '</tr>' +
                '</table>' +

                '<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">' +
                '<tr>' + celdaEtiqueta('Bitácoras N°') + '<td style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px;" colspan="2">PERÍODO A REPORTAR</td></tr>' +
                '<tr>' + celdaValor(bit.numero, 'center') + celdaValor(bit.periodoDesde, 'center') + celdaValor(bit.periodoHasta, 'center') + '</tr>' +
                '</table>' +

                barraNegra('Datos del aprendiz') +
                '<table style="width:100%;border-collapse:collapse;">' +
                '<tr>' + celdaEtiqueta('NOMBRE DEL APRENDIZ') + celdaEtiqueta('TIPO DE DOCUMENTO') + celdaEtiqueta('NUMERO DE IDENTIFICACION') + celdaEtiqueta('TELEFONO') + '</tr>' +
                '<tr>' + celdaValor(c.aprendiz_nombre, 'center') + celdaValor(c.aprendiz_tipo_doc, 'center') + celdaValor(c.aprendiz_num_doc, 'center') + celdaValor(c.aprendiz_telefono, 'center') + '</tr>' +
                '<tr>' + celdaEtiqueta('Correo electrónico institucional') + celdaEtiqueta('Correo electrónico personal') + celdaEtiqueta('Direccion Residencial') + '<td style="border:1px solid #000;"></td>' + '</tr>' +
                '<tr>' + celdaValor(c.aprendiz_correo_institucional, 'center') + celdaValor(c.aprendiz_correo_personal, 'center') + celdaValor(c.aprendiz_direccion, 'center') + '<td style="border:1px solid #000;"></td>' + '</tr>' +
                '<tr>' + celdaEtiqueta('Numero de Grupo') + celdaEtiqueta('Modalidad') + celdaEtiqueta('Programa de Formacion') + '<td style="border:1px solid #000;"></td>' + '</tr>' +
                '<tr>' + celdaValor(c.aprendiz_ficha, 'center') + celdaValor(c.aprendiz_modalidad_formacion, 'center') + celdaValor(c.aprendiz_programa, 'center') + '<td style="border:1px solid #000;"></td>' + '</tr>' +
                '</table>' +

                barraNegra('Datos del ente co-formador') +
                '<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">' +
                '<tr>' + celdaEtiqueta('EMPRESA') + celdaEtiqueta('NIT') + celdaEtiqueta('DIRECCION') + '</tr>' +
                '<tr>' + celdaValor(c.empresa_nombre, 'center') + celdaValor(c.empresa_nit, 'center') + celdaValor(c.empresa_direccion, 'center') + '</tr>' +
                '</table>' +

                barraNegra('Datos de la persona encargada del proceso formativo del aprendiz en la entidad co-formadora') +
                '<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">' +
                '<tr>' + celdaEtiqueta('NOMBRE DEL ENTE COFORMADOR') + celdaEtiqueta('CARGO DEL ENTE COFORMADOR') + celdaEtiqueta('TELEFONO') + celdaEtiqueta('CORREO ELECTRÓNICO') + '</tr>' +
                '<tr>' + celdaValor(c.coformador_nombre, 'center') + celdaValor(c.coformador_cargo, 'center') + celdaValor(c.coformador_telefono, 'center') + celdaValor(c.coformador_correo, 'center') + '</tr>' +
                '</table>' +

                barraNegra('Datos del instructor de seguimiento') +
                '<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">' +
                '<tr>' + celdaEtiqueta('NOMBRE DE LA PERSONA CON ROL DE INSTRUCTOR DE SEGUIMIENTO:') + celdaEtiqueta('CORREO ELECTRÓNICO:') + '</tr>' +
                '<tr>' + celdaValor(c.instructor_nombre, 'center') + celdaValor(c.instructor_correo, 'center') + '</tr>' +
                '</table>' +

                '<div style="border:1px solid #000;padding:3px;font-size:7.5px;margin-bottom:4px;">Seleccione con una "X" el tipo de alternativa de etapa productiva que está realizando, teniendo en cuenta el subtipo al cual pertenece si es el caso:</div>' +

                '<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">' +
                '<tr>' +
                '<td style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px;">ALTERNATIVA DE ETAPA PRODUCTIVA</td>' +
                '<td style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px;width:60px;">Marque con una X</td>' +
                '<td style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px;">Alternativa de etapa productiva</td>' +
                '<td style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px;width:60px;">Marque con una X</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="border:1px solid #000;font-size:8px;padding:3px;">Contrato de Aprendizaje.</td>' +
                '<td style="border:1px solid #000;text-align:center;font-weight:bold;">' + xSi('altContrato') + '</td>' +
                '<td style="border:1px solid #000;font-size:8px;padding:3px;">Monitoria.</td>' +
                '<td style="border:1px solid #000;text-align:center;font-weight:bold;">' + xSi('altMonitoria') + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="border:1px solid #000;font-size:8px;padding:3px;" rowspan="2">Vínculo Formativo.</td>' +
                '<td style="border:1px solid #000;text-align:center;font-weight:bold;" rowspan="2">' + xSi('altVinculo') + '</td>' +
                '<td style="border:1px solid #000;font-size:8px;padding:3px;">Proyecto productivo.</td>' +
                '<td style="border:1px solid #000;text-align:center;font-weight:bold;">' + xSi('altProyecto') + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="border:1px solid #000;font-size:8px;padding:3px;">Vínculo laboral.</td>' +
                '<td style="border:1px solid #000;text-align:center;font-weight:bold;">' + xSi('altLaboral') + '</td>' +
                '</tr>' +
                '</table>' +

                '<table style="width:100%;border-collapse:collapse;margin-bottom:6px;">' +
                '<tr>' +
                '<td style="border:1px solid #000;background:#000;color:#fff;font-weight:bold;text-align:center;font-size:7px;padding:2px;">DESCRIPCIÓN DE LA ACTIVIDAD</td>' +
                '<td style="border:1px solid #000;background:#000;color:#fff;font-weight:bold;text-align:center;font-size:7px;padding:2px;">Competencias del programa de formación aplicadas en el desarrollo de la actividad</td>' +
                '<td style="border:1px solid #000;background:#000;color:#fff;font-weight:bold;text-align:center;font-size:7px;padding:2px;">FECHA DE INICIO</td>' +
                '<td style="border:1px solid #000;background:#000;color:#fff;font-weight:bold;text-align:center;font-size:7px;padding:2px;">FECHA DE FIN</td>' +
                '<td style="border:1px solid #000;background:#000;color:#fff;font-weight:bold;text-align:center;font-size:7px;padding:2px;">EVIDENCIA DE CUMPLIMIENTO</td>' +
                '<td style="border:1px solid #000;background:#000;color:#fff;font-weight:bold;text-align:center;font-size:7px;padding:2px;">OBSERVACIONES, INASISTENCIAS, DIFICULTADES PRESENTADAS</td>' +
                '</tr>' +
                filasActividades +
                '</table>' +

                '<div style="border:1px solid #000;background:#f2f2f2;font-weight:bold;text-align:center;font-size:7.5px;padding:2px;">' + escapeHtml(TEXTO_DECRETO) + '</div>' +
                '<div style="border:1px solid #000;font-size:7.5px;padding:2px;">' + escapeHtml(TEXTO_ESPACIO_OBLIGATORIO) + '</div>' +
                '<div style="border:1px solid #000;font-size:7px;padding:3px;margin-bottom:4px;">' +
                escapeHtml(TEXTO_ARTICULO_11) + '<br>' + escapeHtml(TEXTO_OBLIGACION_1) + '<br>' + escapeHtml(TEXTO_OBLIGACION_2) +
                '</div>' +

                '<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">' +
                '<tr>' +
                celdaEtiqueta('¿La persona con rol de aprendiz se encuentra afiliado a la ARL?') +
                celdaEtiqueta('Indique el nivel de riesgo actual') +
                celdaEtiqueta('¿El nivel de riesgo de la ARL corresponde a las actividades que desarrolla la persona con rol de aprendiz en la empresa?') +
                celdaEtiqueta('¿La persona con rol de aprendiz cuenta con los elementos de protección personal (EPP), requeridos para desarrollar su etapa productiva?') +
                '</tr>' +
                '<tr>' + celdaValor(c.arl_afiliado, 'center') + celdaValor(c.arl_nivel_riesgo, 'center') + celdaValor(c.arl_nivel_corresponde, 'center') + celdaValor(c.arl_epp, 'center') + '</tr>' +
                '</table>' +

                '<table style="width:100%;border-collapse:collapse;">' +
                '<tr>' +
                '<td style="border:0;text-align:center;padding:6px 6px 0 6px;height:55px;width:50%;vertical-align:bottom;">' + bloqueFirma(datos.firmas.firmaAprendiz) + '</td>' +
                '<td style="border:0;text-align:center;padding:6px 6px 0 6px;vertical-align:bottom;">' + escapeHtml(c.fecha_entrega || '') + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="border:0;border-top:1px solid #000;text-align:center;font-size:7.5px;padding:2px;">Firma de la persona con rol de aprendiz</td>' +
                '<td style="border:0;border-top:1px solid #000;text-align:center;font-size:7.5px;padding:2px;">Fecha entrega bitácora</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="border:0;text-align:center;padding:16px 6px 0 6px;height:55px;vertical-align:bottom;">' + bloqueFirma(datos.firmas.firmaInstructor) + '</td>' +
                '<td style="border:0;text-align:center;padding:16px 6px 0 6px;vertical-align:bottom;">' + bloqueFirma(datos.firmas.firmaCoformador) + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td style="border:0;border-top:1px solid #000;text-align:center;font-size:7.5px;padding:2px;">Firma del instructor de seguimiento</td>' +
                '<td style="border:0;border-top:1px solid #000;text-align:center;font-size:7.5px;padding:2px;">Firma de la persona con rol de jefe inmediato</td>' +
                '</tr>' +
                '</table>' +

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
            var nombre = partes.join(' - ');
            return nombre.replace(/[\\/:*?"<>|]/g, '-');
        }

