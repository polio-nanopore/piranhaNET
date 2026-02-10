#!/usr/bin/env bash
set -ex

[ ! -d /tmp/tmpco1w7ijb/barcode07/reference_analysis/Poliovirus2-Sabin_AY184220/medaka_haploid_variant ] && mkdir -p /tmp/tmpco1w7ijb/barcode07/reference_analysis/Poliovirus2-Sabin_AY184220/medaka_haploid_variant
echo 'did that thing'
    if [ -s /tmp/tmpco1w7ijb/barcode07/reference_groups/Poliovirus2-Sabin_AY184220.reference.fasta ]
    then
        medaka_haploid_variant -i /tmp/tmpco1w7ijb/barcode07/reference_groups/Poliovirus2-Sabin_AY184220.fastq \
        -r /tmp/tmpco1w7ijb/barcode07/reference_groups/Poliovirus2-Sabin_AY184220.reference.fasta \
        -o /tmp/tmpco1w7ijb/barcode07/reference_analysis/Poliovirus2-Sabin_AY184220/medaka_haploid_variant
        -m r941_min_hac_variant_g507
        -f -x && \
        medaka stitch /tmp/tmpco1w7ijb/barcode07/reference_analysis/Poliovirus2-Sabin_AY184220/medaka_haploid_variant/consensus_probs.hdf /tmp/tmpco1w7ijb/barcode07/reference_groups/Poliovirus2-Sabin_AY184220.reference.fasta /tmp/tmpco1w7ijb/barcode07/reference_analysis/Poliovirus2-Sabin_AY184220/medaka_haploid_variant/consensus.fasta
    else
        touch /tmp/tmpco1w7ijb/barcode07/reference_analysis/Poliovirus2-Sabin_AY184220/medaka_haploid_variant/consensus.fasta
        touch /tmp/tmpco1w7ijb/barcode07/reference_analysis/Poliovirus2-Sabin_AY184220/medaka_haploid_variant/consensus_probs.hdf
        touch /tmp/tmpco1w7ijb/barcode07/reference_analysis/Poliovirus2-Sabin_AY184220/medaka_haploid_variant/medaka.vcf
    fi
    cp /tmp/tmpco1w7ijb/barcode07/reference_analysis/Poliovirus2-Sabin_AY184220/medaka_haploid_variant/medaka.vcf /tmp/tmpco1w7ijb/barcode07/variant_calls/Poliovirus2-Sabin_AY184220.vcf