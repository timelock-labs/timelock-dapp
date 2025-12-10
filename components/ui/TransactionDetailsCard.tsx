'use client';

import { useState, useCallback, useMemo } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ChainLabel from '@/components/web3/ChainLabel';
import { ethers } from 'ethers';

interface TransactionDetailsCardProps {
  value: string;
  valueUnit: string;
  targetAddress: string;
  transactionHash: string;
  chainId: string | number;
  createdAt: string;
  eta: string;
  expiredAt: string;
  functionSignature?: string;
  callDataHex?: string;
}

const COPY_TIMEOUT_MS = 2000;

const truncateAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

const formatTargetAddress = (address: string): React.ReactNode => {
  if (address.length <= 20) return address;
  const start = address.slice(0, 7);
  const middle = address.slice(7, -5);
  const end = address.slice(-5);
  return (
    <>
      <span className='text-gray-800 text-sm sm:text-base md:text-lg font-extrabold mr-1 sm:mr-2'>{start}</span>
      <span className='text-gray-400 hidden sm:inline'>{middle}</span>
      <span className='text-gray-800 text-sm sm:text-base md:text-lg font-extrabold ml-1 sm:ml-2'>{end}</span>
    </>
  );
};

const TransactionDetailsCard: React.FC<TransactionDetailsCardProps> = ({
  value,
  valueUnit,
  targetAddress,
  transactionHash,
  chainId,
  createdAt,
  eta,
  expiredAt,
  functionSignature,
  callDataHex,
}) => {
  const t = useTranslations('Transactions');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRawHex, setShowRawHex] = useState(false);

  const handleCopy = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), COPY_TIMEOUT_MS);
  }, []);

  // Decoded param type
  interface DecodedParam {
    name: string;
    type: string;
    value: string;
  }

  // Decode calldata using function signature
  const decodedParams = useMemo((): { params: DecodedParam[] } | null => {
    if (!functionSignature || !callDataHex) return null;
    
    try {
      // Parse function signature to get parameter types
      // e.g., "approve(address,uint256)" -> ["address", "uint256"]
      const match = functionSignature.match(/\(([^)]*)\)/);
      if (!match) return null;
      
      const paramTypesStr = match[1];
      if (!paramTypesStr) return { params: [] };
      
      const paramTypes = paramTypesStr.split(',').map((t: string) => t.trim()).filter(Boolean);
      
      // Extract parameter names from signature if available
      // e.g., "approve(address spender, uint256 amount)" -> ["spender", "amount"]
      const paramNames = paramTypesStr.split(',').map((param: string) => {
        const parts = param.trim().split(/\s+/);
        return parts.length > 1 ? parts[parts.length - 1] : null;
      });
      
      // Call Data Hex does NOT include function selector, it's just the parameters
      // Ensure it has 0x prefix
      const dataToDeccode = callDataHex.startsWith('0x') ? callDataHex : '0x' + callDataHex;
      
      // Create ABI coder and decode (ethers v5)
      const pureTypes: string[] = paramTypes.map((t: string) => t.split(/\s+/)[0]).filter((t): t is string => !!t);
      const decoded = ethers.utils.defaultAbiCoder.decode(pureTypes, dataToDeccode);
      
      // Format decoded values
      const formattedValues: DecodedParam[] = decoded.map((val: unknown, idx: number) => {
        const type = pureTypes[idx] || 'unknown';
        const name = paramNames[idx] || `param${idx}`;
        let displayValue = '';
        
        if (typeof val === 'bigint') {
          displayValue = val.toString();
        } else if (typeof val === 'string') {
          displayValue = val;
        } else {
          displayValue = String(val);
        }
        
        return { name, type, value: displayValue };
      });
      
      return { params: formattedValues };
    } catch (error) {
      console.error('Failed to decode calldata:', error);
      return null;
    }
  }, [functionSignature, callDataHex]);

  return (
    <div className='flex-1 bg-white rounded-xl border border-gray-200 p-3 sm:p-4 md:p-5 flex flex-col justify-center'>
      {/* Target Address, Function Signature & Value */}
      <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 mb-3 sm:mb-4'>
        <div className='flex flex-col gap-1 min-w-0'>
          <span className='text-[10px] sm:text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider'>{t('targetAddress').toUpperCase()}</span>
          <div className='flex items-start gap-2'>
            {/* Mobile: show full address, allow wrapping */}
            <span className='text-xs font-mono text-gray-900 break-all sm:hidden'>
              {targetAddress}
            </span>
            {/* Desktop: previous formatted/truncated style */}
            <span className='hidden sm:inline text-xs sm:text-sm font-mono text-gray-900 truncate'>
              {formatTargetAddress(targetAddress)}
            </span>
            <button
              onClick={() => handleCopy(targetAddress, 'target')}
              className='mt-0.5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer flex-shrink-0'
            >
              {copiedField === 'target' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        <div className='flex flex-col gap-1 min-w-0'>
          <span className='text-[10px] sm:text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider'>{t('functionSignature').toUpperCase()}</span>
          <span className='text-base sm:text-lg font-bold text-gray-900 font-mono truncate'>
            {functionSignature || '--'}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-[10px] sm:text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider'>{t('value').toUpperCase()}</span>
          <span className='text-base sm:text-lg font-bold text-gray-900 font-mono'>
            {value} <span>{valueUnit}</span>
          </span>
        </div>
      </div>

      {/* Call Data Hex / Decoded Params */}
      <div className='flex flex-col gap-1 mb-4 sm:mb-6'>
        <div className='flex items-center gap-2'>
          <span className='text-[10px] sm:text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider'>
            {showRawHex ? t('callDataHex').toUpperCase() : t('decodedParams').toUpperCase()}
          </span>
          {callDataHex && (
            <button
              onClick={() => setShowRawHex(!showRawHex)}
              className='flex items-center gap-1 text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer'
              title={showRawHex ? t('showDecoded') : t('showRawHex')}
            >
              <RefreshCw size={12} />
              <span>{showRawHex ? t('showDecoded') : t('showRawHex')}</span>
            </button>
          )}
        </div>
        
        {showRawHex ? (
          <div className='relative'>
            <textarea
              readOnly
              value={callDataHex || '--'}
              className='w-full text-xs sm:text-sm font-mono text-gray-900 bg-gray-50 border border-gray-200 rounded-md p-2 resize-none overflow-auto'
              rows={3}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            {callDataHex && (
              <button 
                onClick={() => handleCopy(callDataHex, 'calldata')} 
                className='absolute top-2 right-2 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer bg-gray-50 p-1 rounded'
              >
                {copiedField === 'calldata' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
          </div>
        ) : (
          <div className='flex flex-col gap-1'>
            {decodedParams && decodedParams.params.length > 0 ? (
              decodedParams.params.map((param, idx) => (
                <div key={idx} className='flex gap-2 text-xs sm:text-sm font-mono item'>
                  <span className='text-gray-500 flex-shrink-0'>{param.name}</span>
                  <span className='text-gray-400 flex-shrink-0'>({param.type}):</span>
                  <span className='text-gray-900 break-all'>{param.value}</span>
                  <button 
                    onClick={() => handleCopy(param.value, `param-${idx}`)} 
                    className='text-gray-400 hover:text-gray-900 transition-colors cursor-pointer flex-shrink-0'
                  >
                    {copiedField === `param-${idx}` ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              ))
            ) : (
              <span className='text-xs sm:text-sm font-mono text-gray-500'>
                {callDataHex ? t('unableToDecodeParams') : '--'}
              </span>
            )}
          </div>
        )}
      </div>

      <div className='h-px bg-gray-100 w-full mb-4 sm:mb-6'></div>

      {/* Details Grid */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-sm'>
        {/* Chain */}
        <div className='flex flex-col gap-1'>
          <span className='text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider'>{t('chain').toUpperCase()}</span>
          <div className='flex items-center gap-1.5'>
            <ChainLabel chainId={chainId} />
          </div>
        </div>

        {/* TX Hash */}
        <div className='flex flex-col gap-1'>
          <span className='text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider'>{t('txHash').toUpperCase()}</span>
          <div className='flex items-center gap-1 sm:gap-2'>
            <span className='font-mono text-xs sm:text-sm text-gray-900 border-b border-dashed border-gray-400 pb-0.5 truncate'>{truncateAddress(transactionHash)}</span>
            <button onClick={() => handleCopy(transactionHash, 'hash')} className='text-gray-400 hover:text-gray-900 transition-colors cursor-pointer flex-shrink-0'>
              {copiedField === 'hash' ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Created At */}
        <div className='flex flex-col gap-1'>
          <span className='text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider'>{t('createdAt').toUpperCase()}</span>
          <span className='font-medium text-xs sm:text-sm text-gray-900 font-mono truncate'>{createdAt}</span>
        </div>

        {/* ETA */}
        <div className='flex flex-col gap-1'>
          <span className='text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider'>{t('eta').toUpperCase()}</span>
          <span className='font-medium text-xs sm:text-sm text-gray-900 font-mono truncate'>{eta}</span>
        </div>

        {/* Expired At */}
        <div className='flex flex-col gap-1 col-span-2 sm:col-span-1 lg:col-span-2'>
          <span className='text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider'>{t('expiredAt').toUpperCase()}</span>
          <span className='font-medium text-xs sm:text-sm text-gray-900 font-mono truncate'>{expiredAt}</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsCard;