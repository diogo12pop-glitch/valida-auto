import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CAKTO_WEBHOOK_SECRET = Deno.env.get('CAKTO_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
  'SUPABASE_SERVICE_ROLE_KEY'
)!

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Método não permitido',
        }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const payload = await req.json()

    console.log('Evento recebido:', payload?.event)

    if (payload?.secret !== CAKTO_WEBHOOK_SECRET) {
      console.error('Secret do webhook inválido.')

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Não autorizado.',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    if (payload?.event !== 'purchase_approved') {
      console.log('Evento ignorado:', payload?.event)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Evento ignorado.',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const purchase = payload?.data

    const customerEmail = purchase?.customer?.email
      ?.trim()
      ?.toLowerCase()

    const paymentId = purchase?.id

    console.log('Compra aprovada:', {
      paymentId,
      customerEmail,
      amount: purchase?.amount,
      status: purchase?.status,
    })

    if (!customerEmail || !paymentId) {
      throw new Error(
        'E-mail ou ID da compra não encontrado.'
      )
    }

    const { data: request, error: findError } = await supabase
      .from('certificate_requests')
      .select('*')
      .eq('email', customerEmail)
      .eq('status', 'pending_payment')
      .order('created_at', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

    if (findError) {
      console.error(
        'Erro ao localizar cadastro:',
        findError
      )

      throw findError
    }

    if (!request) {
      console.error(
        'Nenhum cadastro pendente encontrado para:',
        customerEmail
      )

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cadastro não encontrado.',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    const { error: updateError } = await supabase
      .from('certificate_requests')
      .update({
        status: 'paid',
        payment_id: paymentId,
        paid_at:
          purchase?.paidAt ??
          new Date().toISOString(),
      })
      .eq('id', request.id)

    if (updateError) {
      console.error(
        'Erro ao atualizar cadastro:',
        updateError
      )

      throw updateError
    }

    console.log(
      'Pagamento vinculado ao cadastro:',
      request.id
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pagamento processado com sucesso.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Erro no webhook:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno ao processar webhook.',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
})