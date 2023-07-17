import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * Decorator used for public endpoitns (ones that skip auth)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);