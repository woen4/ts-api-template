import "dotenv/config";
import { clearOverlays } from "./utils/clean-up-overlays";
import { BrowserService } from "./core/initialize-browserbase";
import { handleDownload } from "./utils/handle-downloads";

const PAGE = 'https://www.itau.com.br/empresas';
const OPERATOR_CODE = '';
const PASSWORD = '';

async function main() {
	const { browser, page, sessionId } = await BrowserService.getInstance().createSession();

	try {
		console.log(`🚀 Iniciando automação Itaú na sessão: ${sessionId}`);

		page.on('response', response => {
			if (response.url().includes('router') && response.status() >= 400) {
				console.error(`⚠️ Bloqueio detectado no Roteador: ${response.status()} - ${response.url()}`);
			}
		});

		await page.goto(PAGE, { waitUntil: 'domcontentloaded' });

		await clearOverlays(page);

		const INITIAL_BTN = '#open_modal_more_access';
		await page.waitForSelector(INITIAL_BTN);
		await page.click(INITIAL_BTN);

		const LOGIN_TYPE_SELECT = '#idl-more-access-select-login';
		await page.waitForSelector(LOGIN_TYPE_SELECT);
		await page.selectOption(LOGIN_TYPE_SELECT, 'operator');

		const OPERATOR_INPUT = '#idl-more-access-input-operator';
		await page.waitForSelector(OPERATOR_INPUT);
		await page.click(OPERATOR_INPUT);
		await page.type(OPERATOR_INPUT, OPERATOR_CODE, { delay: 100 });

		await page.keyboard.press('Tab');
		await page.waitForTimeout(500);
		await page.keyboard.press('Enter');

		const SUBMIT_BTN = '#idl-more-access-submit-button';

		await page.waitForFunction((selector: string) => {
			const btn = document.querySelector(selector) as HTMLButtonElement | null;
			return !!btn && !btn.disabled && btn.getAttribute('aria-disabled') !== 'true';
		}, SUBMIT_BTN);

		try {
			console.log("👀 Aguardando redirecionamento e carregamento do teclado...");

			await Promise.all([
				page.waitForURL('**/router-app/router**', {
					waitUntil: 'domcontentloaded',
					timeout: 60000
				}),

				page.click(SUBMIT_BTN)
			]);

			await page.waitForLoadState('load');

			await page.waitForSelector('a#campoTeclado', { state: 'visible', timeout: 60000 });

			try {
				await page.waitForLoadState('networkidle', { timeout: 10000 });
			} catch (e) {
				console.log("⚠️ Network não ficou ociosa, mas seguindo após timeout de segurança...");
			}

			await page.waitForTimeout(2000);

			await clearOverlays(page);

			await preencherSenha(page, PASSWORD);

			await page.click('#acessar');

			// Last step: access type
			console.log("⏳ Aguardando tela de seleção de tipo de acesso...");
			await page.waitForSelector('#rdBasico', { state: 'visible', timeout: 30000 });

			console.log("🔘 Selecionando Acesso Básico...");
			await page.click('label[for="rdBasico"]');

			const BTN_CONTINUAR_FINAL = '#btn-continuar';

			console.log("⏳ Aguardando liberação do botão Continuar...");
			await page.waitForSelector(BTN_CONTINUAR_FINAL, { state: 'visible', timeout: 15000 });

			await page.click(BTN_CONTINUAR_FINAL);
			console.log("🚀 Redirecionando para o Dashboard... Login concluído com sucesso!");

			try {
				await page.waitForLoadState(
					'networkidle',
					{ timeout: 60000 }
				);

				console.log("✅ DASHBOARD CARREGADO!");
			} catch (e) {
				console.log("⚠️ Navegação demorada, mas o comando foi enviado.");
			}

			await navigateToExtractsPage(page);

			await page.waitForTimeout(4000);

			await fecharModalCoachmark(page);

			await capturarExtratoPDF(page);
		} catch (e) {
			console.error("❌ O roteador não respondeu a tempo. Possível bloqueio de segurança.");
			await page.screenshot({ path: `downloads/fail_router_${Date.now()}.png` });
			throw e;
		}

		const keepAlive = setInterval(async () => {
			try {
				await page.evaluate(() => document.title);
			} catch {
				clearInterval(keepAlive);
			}
		}, 15000);

		await new Promise<void>((resolve) => {
			browser.on('disconnected', () => {
				clearInterval(keepAlive);
				resolve();
			});
		});

	} catch (error) {
		console.error(`❌ Falha na automação do Itaú:`, error);
	}
}

async function navigateToExtractsPage(page: any) {
	await page.click('button:has-text("Conta corrente")');

	const extratoDetalhadoBtn = page.getByRole('menuitem', { name: /Extrato Detalhado/i });
	await extratoDetalhadoBtn.waitFor({ state: 'visible', timeout: 10000 });
	await extratoDetalhadoBtn.click();
}

async function preencherSenha(page: any, senha: string) {
	const digitos = senha.split('');

	for (const [index, digito] of digitos.entries()) {
		const botao = page.locator('a#campoTeclado', {
			hasText: new RegExp(`^${digito}| ou ${digito}$|^${digito} ou`)
		}).first();

		// No primeiro dígito, fazemos uma espera extra para garantir que o botão aceita cliques
		if (index === 0) {
			await botao.waitFor({ state: 'visible', timeout: 15000 });
			// O 'trial: true' testa se o elemento pode receber o clique sem realmente clicar
			await botao.click({ trial: true });
		}

		const delayHumano = Math.floor(Math.random() * (1200 - 600 + 1)) + 600;

		console.log(`Digitando: ${digito} (espera de ${delayHumano}ms)`);

		// delay: 200 simula o tempo de "dedo pressionado" no botão
		await botao.click({ delay: 200 });
		await page.waitForTimeout(delayHumano);
	}
}

async function getContentFrame(page: any): Promise<any> {
	const iframeHandle = await page.$('iframe[id^="iframe-nf2"]');
	if (iframeHandle) {
		const frame = await iframeHandle.contentFrame();
		if (frame) return frame;
	}
	const nf2Frame = page.frame({ url: /internetempresas|router-app/ });
	if (nf2Frame) return nf2Frame;
	return page;
}

/**
 * Busca um seletor CSS em TODOS os contextos (page + todos os frames).
 * Retorna o contexto onde encontrou, ou null.
 */
async function findInAllContexts(page: any, selector: string): Promise<any | null> {
	// Tenta na página principal
	const inPage = await page.evaluate((sel: string) => {
		return !!document.querySelector(sel);
	}, selector).catch(() => false);
	if (inPage) {
		console.log(`   🎯 Encontrado em: página principal`);
		return page;
	}

	// Tenta em cada frame
	for (const frame of page.frames()) {
		try {
			const inFrame = await frame.evaluate((sel: string) => {
				return !!document.querySelector(sel);
			}, selector).catch(() => false);
			if (inFrame) {
				console.log(`   🎯 Encontrado em: frame ${frame.name() || frame.url().substring(0, 60)}`);
				return frame;
			}
		} catch {}
	}

	return null;
}

async function fecharModalCoachmark(page: any) {
	console.log("🔍 Verificando se há modal de coachmark...");

	try {
		const MODAL_SELECTOR = '.cdk-overlay-container .voxel-modal__content';
		let modalCtx: any = null;

		for (let i = 0; i < 10; i++) {
			modalCtx = await findInAllContexts(page, MODAL_SELECTOR);
			if (modalCtx) break;
			console.log(`   Tentativa ${i + 1}/10 - modal não encontrada, aguardando 1s...`);
			await page.waitForTimeout(1000);
		}

		if (!modalCtx) {
			console.log("ℹ️ Nenhuma modal de coachmark encontrada após 10 tentativas");
			return;
		}

		console.log("📋 Modal de coachmark detectada! Fechando...");
		await page.waitForTimeout(500);

		const result = await modalCtx.evaluate(() => {
			const primary = document.querySelector<HTMLButtonElement>(
				'.cdk-overlay-container .voxel-modal__footer button'
			);
			if (primary) { primary.click(); return 'clicked-primary'; }

			const close = document.querySelector<HTMLButtonElement>(
				'.cdk-overlay-container .voxel-modal__close'
			);
			if (close) { close.click(); return 'clicked-close'; }

			const overlay = document.querySelector('.cdk-overlay-container');
			if (overlay) { (overlay as HTMLElement).innerHTML = ''; return 'removed-overlay'; }

			return 'nothing-found';
		});

		console.log(`✅ Modal coachmark: ${result}`);
		await page.waitForTimeout(1000);

		// Verifica se fechou
		const stillOpen = await modalCtx.evaluate(() => {
			return !!document.querySelector('.cdk-overlay-container .voxel-modal__content');
		}).catch(() => false);

		if (stillOpen) {
			console.log("⚠️ Modal ainda aberta, removendo via DOM...");
			await modalCtx.evaluate(() => {
				document.querySelectorAll('.cdk-overlay-backdrop').forEach(el => (el as HTMLElement).style.display = 'none');
				document.querySelectorAll('.cdk-overlay-pane').forEach(el => (el as HTMLElement).style.display = 'none');
			});
			console.log("✅ Overlay escondido via CSS");
		}
	} catch (e) {
		console.log("⚠️ Erro ao fechar modal:", e);
	}
}

async function capturarExtratoPDF(page: any) {
	console.log("📄 Iniciando captura do extrato em PDF...");

	try {
		const ctx = await getContentFrame(page);

		// 1. Clica no legend "Salvar extrato" para expandir
		const expanded = await ctx.evaluate(() => {
			const legends = document.querySelectorAll('legend');
			for (const legend of legends) {
				if ((legend.textContent || '').includes('Salvar extrato')) {
					(legend as HTMLElement).click();
					return 'legend-clicked';
				}
			}
			return 'legend-not-found';
		});
		console.log(`   1. Legend: ${expanded}`);
		await page.waitForTimeout(1500);

		// 2. Clica no botão "Salvar em PDF"
		const clicked = await ctx.evaluate(() => {
			const buttons = document.querySelectorAll('button');
			for (const btn of buttons) {
				const text = (btn.textContent || '').trim();
				if (text.includes('Salvar em PDF') || text.includes('PDF')) {
					btn.click();
					return `clicked: ${text}`;
				}
			}
			const btnFormatos = document.querySelectorAll('.btnFormatos');
			for (const btn of btnFormatos) {
				const text = (btn.textContent || '').trim();
				if (text.includes('PDF')) {
					(btn as HTMLButtonElement).click();
					return `clicked-btnFormatos: ${text}`;
				}
			}
			return 'pdf-button-not-found';
		});
		console.log(`   2. Botão PDF: ${clicked}`);
		await page.waitForTimeout(2000);

		// 3. Aguarda a modal "Salvar PDF" - busca em TODOS os contextos
		const EXPORT_MODAL = '.exportacao-arquivos-modal-form .voxel-modal__content';
		let modalCtx: any = null;

		for (let i = 0; i < 10; i++) {
			modalCtx = await findInAllContexts(page, EXPORT_MODAL);
			if (modalCtx) break;
			console.log(`   Aguardando modal de exportação... (${i + 1}/10)`);
			await page.waitForTimeout(1000);
		}

		if (!modalCtx) {
			console.error("❌ Modal de exportação PDF não apareceu em nenhum contexto");
			return;
		}
		console.log("   3. Modal 'Salvar PDF' detectada!");

		// 4. Marca todos os checkboxes
		const checkResult = await modalCtx.evaluate(() => {
			const checkboxes = document.querySelectorAll<HTMLInputElement>(
				'.exportacao-arquivos-modal-form input[type="checkbox"]'
			);
			const results: string[] = [];
			checkboxes.forEach((cb, i) => {
				const label = cb.closest('.voxel-form-selection')?.querySelector('label')?.textContent?.trim() || `checkbox-${i}`;
				if (!cb.checked) {
					cb.click();
					results.push(`checked: ${label}`);
				} else {
					results.push(`already-checked: ${label}`);
				}
			});
			return results;
		});
		console.log(`   4. Checkboxes:`, checkResult);
		await page.waitForTimeout(500);

		// 5. Inicia escuta do download ANTES de clicar em "Salvar"
		console.log("   5. Iniciando escuta de download e clicando em Salvar...");

		const [downloadPath] = await Promise.all([
			handleDownload(page, `extrato_itau_${Date.now()}.pdf`),
			modalCtx.evaluate(() => {
				const footerButtons = document.querySelectorAll<HTMLButtonElement>(
					'.exportacao-arquivos-modal-form .voxel-modal__footer button'
				);
				for (const btn of footerButtons) {
					const text = (btn.textContent || '').trim();
					if (text === 'Salvar') {
						btn.click();
						return 'clicked-salvar';
					}
				}
				const primary = document.querySelector<HTMLButtonElement>(
					'.exportacao-arquivos-modal-form .voxel-modal__footer button.voxel-button:not(.voxel-button--secondary)'
				);
				if (primary) {
					primary.click();
					return 'clicked-primary-fallback';
				}
				return 'salvar-not-found';
			}),
		]);

		console.log(`✅ Extrato PDF salvo em: ${downloadPath}`);
	} catch (e) {
		console.error("❌ Falha ao capturar extrato:", e);
		await page.screenshot({ path: `downloads/fail_extrato_${Date.now()}.png`, fullPage: true });
	}
}

main();