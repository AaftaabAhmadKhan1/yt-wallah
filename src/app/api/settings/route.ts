import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { defaultSiteSettings } from '@/data/store';

// GET site settings
export async function GET() {
  let settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
  if (!settings) {
    // Seed with defaults
    settings = await prisma.siteSettings.create({
      data: {
        id: 'default',
        siteName: defaultSiteSettings.siteName,
        siteTagline: defaultSiteSettings.siteTagline,
        siteDescription: defaultSiteSettings.siteDescription,
        logoUrl: defaultSiteSettings.logoUrl,
        primaryColor: defaultSiteSettings.primaryColor,
        accentColor: defaultSiteSettings.accentColor,
        footerText: defaultSiteSettings.footerText,
        socialLinks: JSON.stringify(defaultSiteSettings.socialLinks),
        maintenanceMode: defaultSiteSettings.maintenanceMode,
        welcomeMessage: defaultSiteSettings.welcomeMessage,
        youtubeApiKey: defaultSiteSettings.youtubeApiKey,
      },
    });
  }
  return NextResponse.json({ ...settings, socialLinks: JSON.parse(settings.socialLinks) });
}

// PATCH update site settings
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (body.socialLinks && typeof body.socialLinks === 'object') {
    body.socialLinks = JSON.stringify(body.socialLinks);
  }
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: body,
    create: { id: 'default', ...body },
  });
  return NextResponse.json({ ...settings, socialLinks: JSON.parse(settings.socialLinks) });
}
