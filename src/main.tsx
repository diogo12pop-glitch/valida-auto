import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Gauge,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wrench,
  XCircle,
} from 'lucide-react'
import { supabase } from './lib/supabase'
import './styles.css'

type Question = {
  question: string
  options: string[]
  answer: number
  topic: string
}

const questions: Question[] = [
  {
    topic: 'Arrefecimento',
    question:
      'Um motor começa a trabalhar acima da temperatura normal principalmente em trânsito lento, mas a temperatura volta ao normal quando o veículo ganha velocidade. Qual hipótese merece ser verificada primeiro?',
    options: [
      'Funcionamento da ventoinha e seu acionamento, além do fluxo de ar pelo radiador.',
      'Folga das válvulas, porque ela controla diretamente a temperatura do líquido.',
      'Sensor de rotação, pois ele determina a velocidade da ventoinha em qualquer veículo.',
      'Óleo do motor, porque qualquer alteração na viscosidade impede a ventoinha de funcionar.',
    ],
    answer: 0,
  },
  {
    topic: 'Lubrificação',
    question:
      'A luz de pressão de óleo acende em marcha lenta com o motor quente e apaga quando a rotação sobe. Qual caminho de diagnóstico é mais adequado?',
    options: [
      'Trocar imediatamente a bomba de óleo, sem fazer nenhuma medição.',
      'Confirmar a pressão real com manômetro e avaliar óleo, filtro, sensor e possíveis folgas internas.',
      'Acelerar o motor algumas vezes para limpar o sistema e apagar a luz.',
      'Trocar as velas, porque falhas de ignição reduzem a pressão de óleo em marcha lenta.',
    ],
    answer: 1,
  },
  {
    topic: 'Lubrificação',
    question:
      'Após uma troca de óleo, o nível ficou acima da marca máxima da vareta. Qual é a conduta mais correta?',
    options: [
      'Deixar como está, porque o excesso de óleo é sempre compensado pelo filtro.',
      'Rodar alguns quilômetros para o óleo ocupar todas as galerias e depois conferir novamente.',
      'Corrigir o nível para a faixa especificada pelo fabricante antes de utilizar o veículo normalmente.',
      'Completar com um óleo de viscosidade diferente para equilibrar o nível.',
    ],
    answer: 2,
  },
  {
    topic: 'Combustão',
    question:
      'Um veículo apresenta mistura pobre registrada pela ECU. Antes de trocar sensores ou injetores, qual verificação pode evitar uma troca desnecessária?',
    options: [
      'Procurar entrada de ar falsa na admissão e conferir pressão/volume de combustível.',
      'Trocar o sensor de oxigênio, porque ele sempre é a causa de mistura pobre.',
      'Aumentar a pressão de combustível sem medir nada, até a falha desaparecer.',
      'Trocar as quatro velas, pois mistura pobre é necessariamente causada por velas gastas.',
    ],
    answer: 0,
  },
  {
    topic: 'MAP',
    question:
      'Em um sistema que utiliza sensor MAP, uma mangueira de vácuo do sensor apresenta vazamento. Qual consequência é plausível?',
    options: [
      'O sensor passa a medir uma condição de carga diferente da real, podendo afetar o cálculo de combustível e avanço.',
      'O alternador deixa automaticamente de carregar a bateria.',
      'A pressão de óleo do motor aumenta porque o MAP controla a bomba de óleo.',
      'O ABS deixa de funcionar porque o MAP alimenta diretamente o módulo de freios.',
    ],
    answer: 0,
  },
  {
    topic: 'MAF',
    question:
      'Um veículo equipado com MAF apresenta perda de desempenho e correções de combustível fora do esperado. Qual abordagem é mais profissional?',
    options: [
      'Trocar o MAF imediatamente, sem verificar alimentação, chicote, admissão e leitura do sensor.',
      'Verificar a integridade da admissão, possíveis entradas de ar após o MAF, alimentação elétrica e coerência dos dados.',
      'Desligar a bateria por alguns minutos e considerar o problema resolvido se a luz apagar.',
      'Aumentar a pressão dos pneus, porque ela altera diretamente o sinal elétrico do MAF.',
    ],
    answer: 1,
  },
  {
    topic: 'Temperatura',
    question:
      'O scanner mostra uma temperatura do líquido de arrefecimento muito diferente da temperatura real do motor. Qual é uma das primeiras verificações?',
    options: [
      'Comparar a leitura do sensor com a temperatura real e verificar sensor, conector e circuito.',
      'Trocar a bomba d’água imediatamente, porque ela controla o sinal elétrico do sensor.',
      'Trocar o alternador, pois a temperatura exibida no scanner depende exclusivamente dele.',
      'Substituir o combustível do tanque, porque a temperatura do ECT é calculada pelo combustível.',
    ],
    answer: 0,
  },
  {
    topic: 'Rotação',
    question:
      'O motor gira no arranque, mas não pega e o scanner não registra rotação durante a partida. Qual suspeita ganha força?',
    options: [
      'Circuito/sensor de rotação ou sua leitura, porque a ECU precisa desse sinal para sincronizar o funcionamento.',
      'Filtro de cabine, porque ele determina a referência de rotação do motor.',
      'Reservatório de expansão, porque ele envia o sinal de RPM para a ECU.',
      'Pastilhas de freio, porque a ECU utiliza o desgaste das pastilhas para liberar a ignição.',
    ],
    answer: 0,
  },
  {
    topic: 'Ignição',
    question:
      'Um cilindro apresenta falha de combustão. Para diferenciar uma falha de ignição de uma falha de injeção, qual teste é mais útil?',
    options: [
      'Trocar peças aleatoriamente até a falha mudar de cilindro.',
      'Fazer testes direcionados, como troca cruzada de componentes e verificar se a falha acompanha o componente.',
      'Substituir a bateria, porque qualquer misfire é causado por baixa capacidade da bateria.',
      'Aumentar a rotação do motor e considerar normal se a falha desaparecer.',
    ],
    answer: 1,
  },
  {
    topic: 'Combustão',
    question:
      'Uma vela apresenta aparência muito diferente das outras três. O que isso pode indicar?',
    options: [
      'Que todas as velas estão obrigatoriamente boas, porque uma diferente não influencia o diagnóstico.',
      'Que existe uma condição diferente naquele cilindro, que pode envolver ignição, combustível, compressão ou entrada de óleo.',
      'Que o sensor ABS daquele lado está com defeito.',
      'Que o radiador precisa ser substituído, independentemente dos demais testes.',
    ],
    answer: 1,
  },
  {
    topic: 'Freios',
    question:
      'O pedal de freio está baixo e o sistema foi recentemente aberto para manutenção. Qual hipótese deve ser considerada?',
    options: [
      'Presença de ar no sistema ou procedimento de sangria inadequado, além de outras causas que devem ser verificadas.',
      'Filtro de ar sujo, pois ele determina diretamente a altura do pedal.',
      'Sensor MAP descalibrado, porque o MAP controla a pressão hidráulica dos freios.',
      'Óleo do motor vencido, porque ele é o fluido utilizado no circuito hidráulico de freio.',
    ],
    answer: 0,
  },
  {
    topic: 'Suspensão',
    question:
      'Após passar por um desnível, o veículo continua oscilando várias vezes antes de estabilizar. Qual componente merece atenção?',
    options: [
      'Amortecedores, porque eles ajudam a controlar as oscilações da suspensão.',
      'Bomba de combustível, porque ela controla a altura da carroceria.',
      'Sensor de oxigênio, porque ele regula diretamente o retorno da suspensão.',
      'Compressor do ar-condicionado, porque ele absorve os impactos da roda.',
    ],
    answer: 0,
  },
  {
    topic: 'Scanner',
    question:
      'O scanner apresenta um código de falha relacionado a um sensor. Qual atitude evita o erro de simplesmente trocar a peça?',
    options: [
      'Considerar o código como prova definitiva de que o sensor está queimado.',
      'Apagar o código e liberar o veículo se ele não voltar imediatamente.',
      'Interpretar o código junto dos sintomas, dados em tempo real e testes elétricos/mecânicos antes de condenar o componente.',
      'Trocar todos os sensores relacionados ao sistema para garantir o reparo.',
    ],
    answer: 2,
  },
  {
    topic: 'Diagnóstico',
    question:
      'Um veículo apresenta uma falha intermitente que não aparece no momento da oficina. Qual é uma estratégia de diagnóstico mais adequada?',
    options: [
      'Trocar vários componentes preventivamente até a falha desaparecer.',
      'Coletar informações sobre quando a falha ocorre, verificar dados registrados e reproduzir a condição quando possível.',
      'Informar ao cliente que falhas intermitentes não podem ser diagnosticadas.',
      'Desligar todos os sensores para descobrir qual deles não faz falta.',
    ],
    answer: 1,
  },
  {
    topic: 'Diagnóstico',
    question:
      'Um carro apresenta perda de potência. O scanner não mostra códigos de falha. Qual afirmação é mais correta?',
    options: [
      'Se não há código, o veículo não possui nenhum defeito.',
      'O problema necessariamente está no módulo de injeção.',
      'A ausência de código não elimina falhas mecânicas ou condições fora do esperado; é preciso continuar o diagnóstico com testes.',
      'Basta apagar a memória de falhas novamente para recuperar a potência.',
    ],
    answer: 2,
  },
]

const steps = [
  {
    n: '01',
    title: 'Comece o teste',
    text: 'Responda 15 perguntas sobre fundamentos e situações comuns de mecânica automotiva.',
  },
  {
    n: '02',
    title: 'Pense como no diagnóstico',
    text: 'As alternativas são próximas entre si. Leia com atenção e escolha a conduta mais técnica.',
  },
  {
    n: '03',
    title: 'Veja seu resultado',
    text: 'Você precisa acertar pelo menos 12 das 15 questões para atingir 80%.',
  },
]

const topics = [
  'Motor e funcionamento',
  'Arrefecimento',
  'Lubrificação',
  'Freios e suspensão',
  'Injeção e sensores',
  'Diagnóstico básico',
]

function Landing({ onStart }: { onStart: () => void }) {
  const startTest = () => {
    document.getElementById('teste')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="container nav">
          <a href="#inicio" className="brand" aria-label="ValidaAuto início">
            <span className="brandMark">
              <Wrench size={17} strokeWidth={2.5} />
            </span>
            <span>
              Valida<span>Auto</span>
            </span>
          </a>

          <a href="#como-funciona" className="navLink">
            Como funciona
          </a>
        </div>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="container heroGrid">
            <div className="heroCopy">
              <div className="eyebrow">
                <Sparkles size={16} /> DESAFIO PARA PROFISSIONAIS DA MECÂNICA
              </div>

              <h1>
                Trocar peças, <span>todo mundo troca.</span>
              </h1>

              <p className="lead">
                Entender o que realmente está acontecendo no carro é o que
                diferencia um mecânico que apenas troca peças de um profissional
                que sabe diagnosticar.
              </p>

              <p className="lead">
                <strong>
                  Será que você conseguiria passar pela nossa avaliação?
                </strong>
              </p>

              <div className="proofRow">
                <div className="proofItem">
                  <CheckCircle2 size={18} /> 15 perguntas
                </div>
                <div className="proofItem">
                  <CheckCircle2 size={18} /> Teste rápido
                </div>
                <div className="proofItem">
                  <CheckCircle2 size={18} /> Resultado no final
                </div>
              </div>

              <button className="primaryButton heroButton" onClick={startTest}>
                Aceitar o desafio <ArrowRight size={20} />
              </button>

              <p className="microcopy">
                Leva poucos minutos • Faça com atenção • Resultado ao finalizar
              </p>
            </div>

            <div
              className="heroVisual"
              aria-label="Painel visual de desempenho mecânico"
            >
              <div className="glow" />

              <div className="scoreCard">
                <div className="scoreTop">
                  <span className="statusDot" />
                  <span>AVALIAÇÃO DE CONHECIMENTO</span>
                </div>

                <div className="gaugeWrap">
                  <div className="gauge">
                    <div className="gaugeInner">
                      <Gauge size={29} />
                      <strong>80%</strong>
                      <small>MÍNIMO DE ACERTOS</small>
                    </div>
                  </div>
                </div>

                <div className="metricList">
                  <div>
                    <span>Motor</span>
                    <b>✓</b>
                  </div>
                  <div>
                    <span>Arrefecimento</span>
                    <b>✓</b>
                  </div>
                  <div>
                    <span>Diagnóstico</span>
                    <b>✓</b>
                  </div>
                </div>

                <div className="cardHint">
                  <ShieldCheck size={17} /> Um teste para separar conhecimento
                  de chute.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="trustBar">
          <div className="container trustInner">
            <span>FOCADO EM CONHECIMENTO PRÁTICO</span>
            <span>SEM ENROLAÇÃO</span>
            <span>QUESTÕES DE MECÂNICA BÁSICA</span>
          </div>
        </section>

        <section className="section" id="como-funciona">
          <div className="container">
            <div className="sectionHeader">
              <div className="eyebrow">COMO FUNCIONA</div>
              <h2>É simples. Você entra, responde e descobre seu nível.</h2>
              <p>
                Sem aulas longas, sem cadastro complicado e sem perder tempo.
              </p>
            </div>

            <div className="stepsGrid">
              {steps.map((step) => (
                <article className="stepCard" key={step.n}>
                  <div className="stepNumber">{step.n}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section darkSection">
          <div className="container twoCol">
            <div>
              <div className="eyebrow">O QUE VOCÊ VAI ENCONTRAR</div>
              <h2>
                Conhecimentos que todo profissional da oficina precisa dominar.
              </h2>

              <p className="sectionText">
                As perguntas foram distribuídas entre fundamentos essenciais da
                mecânica. A ideia é testar raciocínio e conhecimento técnico
                básico — não decorar respostas.
              </p>
            </div>

            <div className="topicGrid">
              {topics.map((topic) => (
                <div className="topic" key={topic}>
                  <CheckCircle2 size={18} /> {topic}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section faqSection">
          <div className="container faqWrap">
            <div className="sectionHeader left">
              <div className="eyebrow">ANTES DE COMEÇAR</div>
              <h2>Algumas respostas rápidas.</h2>
            </div>

            <div className="faqList">
              <details open>
                <summary>Preciso ser formado para fazer o teste?</summary>
                <p>
                  Não. O objetivo é avaliar conhecimentos básicos de mecânica
                  automotiva. O teste é aberto para quem trabalha ou estuda na
                  área.
                </p>
              </details>

              <details>
                <summary>O teste é demorado?</summary>
                <p>
                  Não. São 15 perguntas objetivas e a proposta é concluir em
                  poucos minutos.
                </p>
              </details>

              <details>
                <summary>Posso fazer pelo celular?</summary>
                <p>
                  Sim. A página e o teste foram preparados pensando primeiro em
                  quem acessa pelo celular.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="ctaSection" id="teste">
          <div className="container ctaBox">
            <div className="ctaIcon">
              <Wrench size={25} />
            </div>

            <div>
              <div className="eyebrow">AGORA É COM VOCÊ</div>

              <h2>Será que você realmente domina a mecânica?</h2>

              <p>
                Aceite o desafio, responda 15 perguntas e descubra se seu
                conhecimento consegue atingir o mínimo de 80%.
              </p>
            </div>

            <button className="primaryButton" onClick={onStart}>
              Aceitar o desafio <ArrowRight size={20} />
            </button>

            <p className="legal">
              Teste de conhecimento educacional. O resultado não constitui
              certificação profissional oficial ou habilitação regulatória.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footerInner">
          <span>© 2026 ValidaAuto</span>
          <span>Teste de conhecimento em mecânica automotiva</span>
        </div>
      </footer>
    </div>
  )
}

function Quiz({
  onBack,
  onRegister,
}: {
  onBack: () => void
  onRegister: (percentage: number) => void
}) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [finished, setFinished] = useState(false)

  const question = questions[current]

  const score = useMemo(
    () =>
      answers.reduce(
        (total, answer, index) =>
          total + (answer === questions[index].answer ? 1 : 0),
        0
      ),
    [answers]
  )

const choose = (index: number) => {
  setSelected(index)
}

  const next = () => {
    if (selected === null) return

    const nextAnswers = [...answers, selected]
    setAnswers(nextAnswers)

    if (current === questions.length - 1) {
      setFinished(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setCurrent(current + 1)
    setSelected(null)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (finished) {
    const finalScore = answers.reduce(
      (total, answer, index) =>
        total + (answer === questions[index].answer ? 1 : 0),
      0
    )

    const finalPassed = finalScore >= 12
    const finalPercentage = Math.round((finalScore / 15) * 100)

    return (
      <div className="quizPage">
        <div className="quizTopbar">
          <button className="backButton" onClick={onBack}>
            <ArrowLeft size={18} /> Voltar
          </button>

          <div className="brand">
            <span className="brandMark">
              <Wrench size={17} />
            </span>
            <span>
              Valida<span>Auto</span>
            </span>
          </div>
        </div>

        <main className="resultWrap">
          <div className={`resultCard ${finalPassed ? 'approved' : 'reproved'}`}>
            <div className="resultIcon">
              {finalPassed ? (
                <Trophy size={34} />
              ) : (
                <XCircle size={34} />
              )}
            </div>

            <div className="eyebrow">RESULTADO DO TESTE</div>

            {finalPassed ? (
              <>
                <h1>Parabéns! Você foi aprovado.</h1>

                <div className="finalScore">
                  <strong>{finalPercentage}%</strong>
                  <span>de aproveitamento</span>
                </div>

                <div className="approvedCopy">
                  <p>
                    Você acabou de provar que domina conhecimentos fundamentais
                    de mecânica automotiva.
                  </p>

                  <p>
                    Agora imagine ter isso{' '}
                    <strong>visível dentro da sua oficina.</strong>
                  </p>

                  <p>
                    Um certificado bem apresentado pode ajudar a transmitir uma
                    imagem mais{' '}
                    <strong>
                      profissional, organizada e preparada
                    </strong>{' '}
                    para quem entra no seu estabelecimento.
                  </p>

                  <p>
                    Por apenas <strong>R$ 14,90</strong>, você pode solicitar sua
                    emissão digital e deixar seu resultado visível para seus
                    clientes.
                  </p>
                </div>

                <div className="conversionBox">
                  <div className="conversionKicker">
                    SEU CONHECIMENTO VOCÊ JÁ CONQUISTOU.
                  </div>

                  <div className="conversionHeadline">
                    Agora coloque isso na parede.
                  </div>

                  <button
                    className="primaryButton conversionButton"
                    onClick={() => onRegister(finalPercentage)}
                  >
                    Quero meu certificado <ArrowRight size={20} />
                  </button>

                  <span className="conversionPrice">
                    Emissão digital por R$ 14,90
                  </span>
                </div>
              </>
            ) : (
              <>
                <h1>Quase lá. Você não atingiu o mínimo.</h1>

                <div className="finalScore">
                  <strong>{finalPercentage}%</strong>
                  <span>de aproveitamento</span>
                </div>

                <p>
                  O mínimo para aprovação é 80%. Revise os fundamentos e tente
                  novamente quando estiver preparado.
                </p>

                <div className="resultActions">
                  <button
                    className="primaryButton"
                    onClick={() => {
                      setCurrent(0)
                      setSelected(null)
                      setAnswers([])
                      setFinished(false)

                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                      })
                    }}
                  >
                    Refazer teste <ArrowRight size={20} />
                  </button>

                  <button
                    className="secondaryButton"
                    onClick={onBack}
                  >
                    Voltar para a página inicial
                  </button>
                </div>
              </>
            )}

            <p className="legal">
              Resultado de teste de conhecimento educacional. O documento
              emitido não representa habilitação ou certificação profissional
              oficial.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="quizPage">
      <div className="quizTopbar">
        <button className="backButton" onClick={onBack}>
          <ArrowLeft size={18} /> Sair do teste
        </button>

        <div className="brand">
          <span className="brandMark">
            <Wrench size={17} />
          </span>

          <span>
            Valida<span>Auto</span>
          </span>
        </div>

        <span className="quizCounter">
          {current + 1} / {questions.length}
        </span>
      </div>

      <div className="progressTrack">
        <div
          className="progressFill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="quizWrap">
        <div className="quizMeta">
          <span className="eyebrow">
            QUESTÃO {String(current + 1).padStart(2, '0')}
          </span>

          <span className="topicBadge">{question.topic}</span>
        </div>

        <h1>{question.question}</h1>

        <p className="quizHint">
          Leia todas as alternativas antes de escolher. Existe apenas uma
          resposta mais adequada.
        </p>

        <div className="optionsList">
          {question.options.map((option, index) => {
            const active = selected === index

            return (
              <button
                key={option}
                className={`option ${active ? 'selected' : ''}`}
                onClick={() => choose(index)}
              >
                <span className="optionLetter">
                  {String.fromCharCode(65 + index)}
                </span>

                <span>{option}</span>

                {active && (
                  <CheckCircle2
                    size={20}
                    className="optionCheck"
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="quizFooter">
          <span>
            <ShieldCheck size={17} /> 80% para aprovação
          </span>

          <button
            className="primaryButton"
            disabled={selected === null}
            onClick={next}
          >
            {current === questions.length - 1
              ? 'Ver resultado'
              : 'Próxima pergunta'}{' '}
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  )
}

function Registration({
  percentage,
  onBack,
}: {
  percentage: number
  onBack: () => void
}) {
  const [name, setName] = useState('')
  const [workshop, setWorkshop] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [email, setEmail] = useState('')

  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [requestToken, setRequestToken] = useState('')

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid rgba(255,255,255,.12)',
    background: 'rgba(255,255,255,.04)',
    color: '#fff',
    borderRadius: 14,
    padding: '15px 16px',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(255,255,255,.82)',
  }

  const submit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setSaveError('')

    try {
      const token = crypto.randomUUID()

      const { error } = await supabase
        .from('certificate_requests')
        .insert({
          request_token: token,
          full_name: name.trim(),
          workshop_name: workshop.trim(),
          city: city.trim(),
          state,
          email: email.trim().toLowerCase(),
          percentage,
          status: 'pending_payment',
        })

      if (error) {
        console.error('Erro Supabase:', error)

        throw new Error(
          'Não foi possível registrar seus dados. Tente novamente.'
        )
      }

      setRequestToken(token)
      setSubmitted(true)

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch (error) {
      console.error(error)

      setSaveError(
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao salvar seus dados.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <div className="quizPage">
        <div className="quizTopbar">
          <button className="backButton" onClick={onBack}>
            <ArrowLeft size={18} /> Voltar
          </button>

          <div className="brand">
            <span className="brandMark">
              <Wrench size={17} />
            </span>

            <span>
              Valida<span>Auto</span>
            </span>
          </div>
        </div>

        <main className="resultWrap">
          <div className="resultCard approved">
            <div className="resultIcon">
              <CheckCircle2 size={34} />
            </div>

            <div className="eyebrow">DADOS REGISTRADOS</div>

            <h1>
              Perfeito. Seus dados foram registrados.
            </h1>

            <div className="finalScore">
              <strong>{percentage}%</strong>
              <span>de aproveitamento na avaliação</span>
            </div>

            <div className="approvedCopy">
              <p>
                <strong>{name}</strong>, recebemos os dados necessários para
                personalizar seu certificado.
              </p>

              <p>
                O próximo passo será concluir a emissão digital por{' '}
                <strong>R$ 14,90</strong>.
              </p>
            </div>

            <div className="conversionBox">
              <div className="conversionKicker">
                PRÓXIMA ETAPA
              </div>

              <div className="conversionHeadline">
                Concluir a emissão do certificado.
              </div>

              <button
  className="primaryButton conversionButton"
  onClick={() => {
    window.location.href = `https://pay.cakto.com.br/7cun6xe_1035936?sck=${requestToken}`
  }}
>
  Continuar para pagamento <ArrowRight size={20} />
</button>

              <span className="conversionPrice">
                Emissão digital por R$ 14,90
              </span>
            </div>

            <p
              style={{
                fontSize: 13,
                opacity: 0.65,
                wordBreak: 'break-all',
                marginTop: 16,
              }}
            >
              Referência do pedido: {requestToken}
            </p>

            <p className="legal">
              Seus dados serão usados para personalizar o certificado e,
              nas próximas etapas, associar a emissão ao pagamento.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="quizPage">
      <div className="quizTopbar">
        <button className="backButton" onClick={onBack}>
          <ArrowLeft size={18} /> Voltar
        </button>

        <div className="brand">
          <span className="brandMark">
            <Wrench size={17} />
          </span>

          <span>
            Valida<span>Auto</span>
          </span>
        </div>
      </div>

      <main
        className="quizWrap"
        style={{
          maxWidth: 760,
        }}
      >
        <div className="quizMeta">
          <span className="eyebrow">ETAPA 1 DE 2</span>

          <span className="topicBadge">
            APROVEITAMENTO: {percentage}%
          </span>
        </div>

        <h1>
          Agora vamos personalizar seu certificado.
        </h1>

        <p className="quizHint">
          Preencha os dados exatamente como deseja que apareçam no
          documento. O e-mail será usado posteriormente para a entrega
          digital.
        </p>

        <form
          onSubmit={submit}
          style={{
            display: 'grid',
            gap: 18,
          }}
        >
          <div>
            <label style={labelStyle}>
              Nome completo
            </label>

            <input
              style={inputStyle}
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Ex.: João da Silva"
              required
              minLength={5}
            />
          </div>

          <div>
            <label style={labelStyle}>
              Nome da oficina
            </label>

            <input
              style={inputStyle}
              value={workshop}
              onChange={(event) =>
                setWorkshop(event.target.value)
              }
              placeholder="Ex.: João Auto Center"
              required
              minLength={2}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px',
              gap: 14,
            }}
          >
            <div>
              <label style={labelStyle}>
                Cidade
              </label>

              <input
                style={inputStyle}
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                placeholder="Ex.: Brasília"
                required
                minLength={2}
              />
            </div>

            <div>
              <label style={labelStyle}>
                UF
              </label>

              <select
                style={{
                  ...inputStyle,
                  appearance: 'none',
                }}
                value={state}
                onChange={(event) =>
                  setState(event.target.value)
                }
                required
              >
                <option
                  value=""
                  style={{
                    color: '#111',
                  }}
                >
                  UF
                </option>

                {[
                  'AC',
                  'AL',
                  'AP',
                  'AM',
                  'BA',
                  'CE',
                  'DF',
                  'ES',
                  'GO',
                  'MA',
                  'MT',
                  'MS',
                  'MG',
                  'PA',
                  'PB',
                  'PR',
                  'PE',
                  'PI',
                  'RJ',
                  'RN',
                  'RS',
                  'RO',
                  'RR',
                  'SC',
                  'SP',
                  'SE',
                  'TO',
                ].map((uf) => (
                  <option
                    key={uf}
                    value={uf}
                    style={{
                      color: '#111',
                    }}
                  >
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              E-mail para receber o certificado
            </label>

            <input
              type="email"
              style={inputStyle}
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="voce@exemplo.com"
              required
            />
          </div>

          <div
            className="cardHint"
            style={{
              marginTop: 2,
            }}
          >
            <ShieldCheck size={17} />

            Confira os dados antes de continuar. O percentual de
            aproveitamento será associado automaticamente ao seu cadastro.
          </div>

          {saveError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fecaca',
                padding: '14px 16px',
                borderRadius: 14,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {saveError}
            </div>
          )}

          <button
            type="submit"
            className="primaryButton"
            style={{
              width: '100%',
              justifyContent: 'center',
            }}
            disabled={saving}
          >
            {saving ? 'Salvando seus dados...' : 'Continuar'}
            {!saving && <ArrowRight size={20} />}
          </button>
        </form>

        <p className="legal">
          O certificado é um documento comprobatório da realização e
          aprovação nesta avaliação. Não substitui certificação
          profissional oficial.
        </p>
      </main>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState<
    'landing' | 'quiz' | 'registration'
  >('landing')

  const [approvedPercentage, setApprovedPercentage] =
    useState(0)

  if (screen === 'landing') {
    return (
      <Landing
        onStart={() => {
          setScreen('quiz')

          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        }}
      />
    )
  }

  if (screen === 'registration') {
    return (
      <Registration
        percentage={approvedPercentage}
        onBack={() => {
          setScreen('quiz')

          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        }}
      />
    )
  }

  return (
    <Quiz
      onBack={() => {
        setScreen('landing')

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }}
      onRegister={(percentage) => {
        setApprovedPercentage(percentage)
        setScreen('registration')

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }}
    />
  )
}

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)