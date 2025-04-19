import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

export async function PATCH(request: NextRequest) {

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const note = await request.json()
    console.log(note)
    const supabase = await createClient()
    const { data, error } = await supabase.from('campaigns').update({ note}).eq('id', id)


    if (error) {
        return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    return NextResponse.json({ message: 'Note updated' }, { status: StatusCodes.OK })

}