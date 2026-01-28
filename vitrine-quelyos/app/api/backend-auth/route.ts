import { NextRequest, NextResponse } from 'next/server';

const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069';
const ODOO_DB = process.env.ODOO_DB || 'quelyos';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json({ error: 'Login et mot de passe requis' }, { status: 400 });
    }

    const response = await fetch(`${ODOO_URL}/web/session/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: { db: ODOO_DB, login, password },
        id: 1,
      }),
    });

    const data = await response.json();

    if (data.error || !data.result?.uid) {
      return NextResponse.json(
        { error: data.error?.data?.message || 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Extract session_id from Set-Cookie header
    const setCookie = response.headers.get('set-cookie') || '';
    const sessionMatch = setCookie.match(/session_id=([^;]+)/);
    const sessionId = sessionMatch ? sessionMatch[1] : data.result.session_id;

    // Return success with session info for dashboard handoff
    return NextResponse.json({
      success: true,
      uid: data.result.uid,
      name: data.result.name,
      username: data.result.username || login,
      session_id: sessionId,
      odooUrl: ODOO_URL,
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur de connexion au serveur backend' },
      { status: 500 }
    );
  }
}
