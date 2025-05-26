'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { HStack, Image } from '@chakra-ui/react'
import { FiUpload } from 'react-icons/fi';

export default function FileUploadField({
    uid,
    url,
    size,
    onUpload,
    isDisabled
}: {
    uid: string | null
    url: string | null
    size: number
    onUpload: (url: string) => void
    isDisabled: boolean
}) {
    const supabase = createClient()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (url) {
            setAvatarUrl(url);
        }
    }, [url]);

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${uid}-${Math.random()}.${fileExt}`;

            const { data ,error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = await supabase.storage.from('avatars').getPublicUrl(filePath);
            onUpload(publicUrl);
        } catch (error) {
            alert('Error uploading avatar!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <HStack spaceX={3}>
            <Image
                width={size}
                height={size}
                src={avatarUrl || "https://i.pinimg.com/736x/11/78/2a/11782ac8904252d7b06059a8babe3544.jpg"}
                alt="Avatar"
                className="avatar image"
                rounded={'full'}
                objectFit={'cover'}
                objectPosition={'center'}
                shadow={'sm'}
            />
            <HStack
                borderColor="primary.500"
                color="primary.500"
                border="2px solid"
                fontWeight={'600'}
                padding={'6px 12px'}
                cursor={'pointer'}
                borderRadius={"6px"}
                hidden={isDisabled}
            >
                <label
                    className="button primary block"
                    htmlFor="single"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                    <FiUpload />
                    <span style={{ marginLeft: '8px' }}>{uploading ? 'Uploading ...' : 'Upload'}</span>
                </label>
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                    }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                />
            </HStack>
        </HStack>
    )
}