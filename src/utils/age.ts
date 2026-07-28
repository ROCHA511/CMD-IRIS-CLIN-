/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 * Utilitário de cálculo de idade a partir de data de nascimento
 */

export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  
  let parts: string[] = [];
  if (birthDate.includes('-')) {
    parts = birthDate.split('-'); // YYYY-MM-DD
    const birth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } else if (birthDate.includes('/')) {
    parts = birthDate.split('/'); // DD/MM/AAAA
    const birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  return 0;
}
